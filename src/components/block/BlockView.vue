<template>
  <div>
    <RpcBlockBridge ref='rpcBlockBridge' />
    <RpcAccountBridge ref='rpcAccountBridge' />
    <DbMicrochainBridge ref='dbMicrochainBridge' v-model:microchains='microchains' />
    <DbMicrochainOwnerBridge ref='dbMicrochainOwnerBridge' />
    <DbMicrochainBalanceBridge ref='dbMicrochainBalanceBridge' />
    <DbMicrochainOwnerBalanceBridge ref='dbMicrochainOwnerBalanceBridge' />
    <DbOwnerBridge ref='dbOwnerBridge' />
    <DbTokenBridge ref='dbTokenBridge' />
    <DbActivityBridge ref='dbActivityBridge' />
    <RpcPendingMessagesBridge ref='rpcPendingMessagesBridge' />
    <RpcExecuteBlockBridge ref='rpcExecuteBlockBridge' />
    <RpcBlockMaterialBridge ref='rpcBlockMaterialBridge' />
    <ConstructBlock ref='constructBlock' />
    <SwapApplicationOperationBridge ref='swapApplicationOperationBridge' />
    <ERC20ApplicationOperationBridge ref='erc20ApplicationOperationBridge' />
    <DbApplicationCreatorChainSubscriptionBridge ref='dbApplicationCreatorChainSubscriptionBridge' />
    <DbChainOperationBridge ref='dbChainOperationBridge' />
    <AMSApplicationOperationBridge ref='amsApplicationOperationBridge' />
  </div>
</template>

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { db, rpc } from 'src/model'
import { localStore, operationDef } from 'src/localstores'
import { sha3 } from 'hash-wasm'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { toSnake } from 'ts-case-convert'
import { type HashedCertificateValue, type CandidateBlockMaterial, type ExecutedBlockMaterial } from 'src/__generated__/graphql/service/graphql'
import { useI18n } from 'vue-i18n'

import RpcBlockBridge from '../bridge/rpc/BlockBridge.vue'
import RpcAccountBridge from '../bridge/rpc/AccountBridge.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import DbMicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import DbMicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import DbMicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'
import DbTokenBridge from '../bridge/db/TokenBridge.vue'
import DbActivityBridge from '../bridge/db/ActivityBridge.vue'
import RpcPendingMessagesBridge from '../bridge/rpc/PendingMessagesBridge.vue'
import RpcExecuteBlockBridge from '../bridge/rpc/ExecuteBlockBridge.vue'
import RpcBlockMaterialBridge from '../bridge/rpc/BlockMaterialBridge.vue'
import ConstructBlock from './ConstructBlock.vue'
import SwapApplicationOperationBridge from '../bridge/rpc/SwapApplicationOperationBridge.vue'
import ERC20ApplicationOperationBridge from '../bridge/rpc/ERC20ApplicationOperationBridge.vue'
import DbApplicationCreatorChainSubscriptionBridge from '../bridge/db/ApplicationCreatorChainSubscriptionBridge.vue'
import DbChainOperationBridge from '../bridge/db/ChainOperationBridge.vue'
import AMSApplicationOperationBridge from '../bridge/rpc/AMSApplicationOperationBridge.vue'

const { t } = useI18n({ useScope: 'global' })

const rpcBlockBridge = ref<InstanceType<typeof RpcBlockBridge>>()
const rpcAccountBridge = ref<InstanceType<typeof RpcAccountBridge>>()
const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()
const dbMicrochainOwnerBridge = ref<InstanceType<typeof DbMicrochainOwnerBridge>>()
const dbMicrochainBalanceBridge = ref<InstanceType<typeof DbMicrochainBalanceBridge>>()
const dbMicrochainOwnerBalanceBridge = ref<InstanceType<typeof DbMicrochainOwnerBalanceBridge>>()
const dbOwnerBridge = ref<InstanceType<typeof DbOwnerBridge>>()
const dbTokenBridge = ref<InstanceType<typeof DbTokenBridge>>()
const dbActivityBridge = ref<InstanceType<typeof DbActivityBridge>>()
const rpcPendingMessagesBridge = ref<InstanceType<typeof RpcPendingMessagesBridge>>()
const rpcExecuteBlockBridge = ref<InstanceType<typeof RpcExecuteBlockBridge>>()
const rpcBlockMaterialBridge = ref<InstanceType<typeof RpcBlockMaterialBridge>>()
const constructBlock = ref<InstanceType<typeof ConstructBlock>>()
const swapApplicationOperationBridge = ref<InstanceType<typeof SwapApplicationOperationBridge>>()
const erc20ApplicationOperationBridge = ref<InstanceType<typeof ERC20ApplicationOperationBridge>>()
const dbApplicationCreatorChainSubscriptionBridge = ref<InstanceType<typeof DbApplicationCreatorChainSubscriptionBridge>>()
const dbChainOperationBridge = ref<InstanceType<typeof DbChainOperationBridge>>()
const amsApplicationOperationBridge = ref<InstanceType<typeof AMSApplicationOperationBridge>>()

const microchains = ref([] as db.Microchain[])
const microchainsImportState = computed(() => localStore.setting.MicrochainsImportState)

type stopFunc = () => void
const subscribed = ref(new Map<string, stopFunc>())

const updateChainBalance = async (microchain: db.Microchain, tokenId: number, balance: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const microchainBalance = (await dbMicrochainBalanceBridge.value?.microchainFungibleTokenBalance(microchain, tokenId)) as db.MicrochainFungibleTokenBalance || {
    microchain: microchain.microchain,
    tokenId,
    balance: 0
  } as db.MicrochainFungibleTokenBalance
  microchainBalance.balance = Number(balance)
  microchainBalance.id === undefined
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    ? await dbMicrochainBalanceBridge.value?.createMicrochainFungibleTokenBalance(microchain, microchainBalance.tokenId, microchainBalance.balance)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    : await dbMicrochainBalanceBridge.value?.updateMicrochainFungibleTokenBalance(microchainBalance)
}

const updateAccountBalance = async (microchain: db.Microchain, tokenId: number, publicKey: string, balance: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const owner = await dbOwnerBridge.value?.publicKey2Owner(publicKey) as string
  if (!owner) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const microchainOwnerBalance = (await dbMicrochainOwnerBalanceBridge.value?.microchainOwnerFungibleTokenBalance(microchain.microchain, owner, tokenId)) as db.MicrochainOwnerFungibleTokenBalance || {
    microchain: microchain.microchain,
    owner,
    tokenId,
    balance: 0
  } as db.MicrochainOwnerFungibleTokenBalance
  microchainOwnerBalance.balance = balance
  microchainOwnerBalance.id === undefined
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    ? await dbMicrochainOwnerBalanceBridge.value?.createMicrochainOwnerFungibleBalance(microchain.microchain, owner, tokenId, microchainOwnerBalance.balance)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    : await dbMicrochainOwnerBalanceBridge.value?.updateMicrochainOwnerFungibleBalance(microchainOwnerBalance)
}

const updateChainAccountBalances = async (microchain: db.Microchain, publicKeys: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const balancesResp = await rpcAccountBridge.value?.getChainAccountBalances([microchain.microchain], publicKeys) as rpc.ChainAccountBalances
  if (!balancesResp[microchain.microchain]) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const nativeToken = (await dbTokenBridge.value?.nativeToken()) as db.Token
  if (!nativeToken) return
  await updateChainBalance(microchain, nativeToken.id as number, Number(balancesResp[microchain.microchain].chain_balance))
  for (const publicKey of publicKeys) {
    await updateAccountBalance(microchain, nativeToken.id as number, publicKey, Number(balancesResp[microchain.microchain].account_balances[publicKey]))
  }
}

const parseActivities = async (microchain: db.Microchain, block: HashedCertificateValue) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const nativeTokenId = (await dbTokenBridge.value?.nativeToken())?.id || 1
  for (const bundle of block?.value?.executedBlock?.block?.incomingBundles || []) {
    const origin = bundle.origin as rpc.Origin
    for (const message of bundle.bundle.messages) {
      const _message = message.message as rpc.Message
      if (_message?.System?.Credit) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await dbActivityBridge.value?.createActivity(
          microchain.microchain,
          nativeTokenId,
          origin.sender,
          _message?.System?.Credit?.source,
          block.value.executedBlock?.block.chainId,
          _message?.System?.Credit?.target,
          _message?.System?.Credit?.amount,
          block.value.executedBlock?.block.height,
          block.value.executedBlock?.block.timestamp,
          block.hash,
          message.grant
        )
      } else if (_message?.User) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        const token = await dbTokenBridge.value?.token(_message.User.application_id) as db.Token
        const tokenId = token?.id || 2
        const erc20MessageStr = await lineraWasm.bcs_deserialize_erc20_message(`[${_message.User.bytes.toString()}]`)
        // TODO: it may not be ERC20 message here, we should deserialize it according to application bytecode
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const erc20Message = JSON.parse(erc20MessageStr) as rpc.ERC20Message
        if (erc20Message?.Transfer) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await dbActivityBridge.value?.createActivity(
            microchain.microchain,
            tokenId,
            erc20Message.Transfer.origin.chain_id,
            erc20Message.Transfer.origin.owner,
            block.value.executedBlock?.block.chainId,
            erc20Message.Transfer.to.owner,
            erc20Message.Transfer.amount,
            block.value.executedBlock?.block.height,
            block.value.executedBlock?.block.timestamp,
            block.hash,
            message.grant
          )
        }
      }
    }
  }
  for (const operation of block?.value?.executedBlock?.block.operations || []) {
    const _operation = operation as rpc.Operation
    if (_operation.System?.Transfer) {
      let grant = undefined as unknown as string | undefined
      for (const messages of block?.value?.executedBlock?.outcome?.messages || []) {
        grant = messages.find((el) => {
          const destination = el.destination as rpc.Destination
          const message = el.message as rpc.Message
          return destination?.Recipient === _operation.System?.Transfer.recipient.Account?.chain_id &&
                     message?.System?.Credit?.source === _operation.System?.Transfer.owner &&
                     message?.System?.Credit?.target === _operation?.System.Transfer.recipient?.Account?.owner
        })?.grant as string
        if (grant?.length) break
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await dbActivityBridge.value?.createActivity(
        microchain.microchain,
        nativeTokenId,
        block.value.executedBlock?.block.chainId,
        _operation.System.Transfer.owner,
        _operation.System.Transfer.recipient.Account.chain_id,
        _operation.System.Transfer.recipient.Account.owner,
        _operation.System.Transfer.amount,
        block.value.executedBlock?.block.height,
        block.value.executedBlock?.block.timestamp,
        block.hash,
        grant as string
      )
    }
  }
}

const updateFungibleBalances = async (microchain: db.Microchain, publicKeys: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const tokens = await dbTokenBridge.value?.fungibleTokens() || []
  for (const token of tokens) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const balance = await erc20ApplicationOperationBridge.value?.balanceOf(microchain.microchain, token.applicationId as string) || 0
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
    await updateChainBalance(microchain, token.id as number, balance)
    for (const publicKey of publicKeys) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const balance = await erc20ApplicationOperationBridge.value?.balanceOf(microchain.microchain, token.applicationId as string, publicKey) || 0
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
      await updateAccountBalance(microchain, token.id as number, publicKey, balance)
    }
  }
}

const updateChainOperations = async (microchain: db.Microchain, block: HashedCertificateValue) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const operations = (await dbChainOperationBridge.value?.getChainOperations(0, 0, microchain.microchain, [db.OperationState.EXECUTED]) || []) as db.ChainOperation[]
  for (const operation of operations) {
    if (operation.certificateHash === block.hash) {
      operation.state = db.OperationState.CONFIRMED
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await dbChainOperationBridge.value?.updateChainOperation(operation)
    }
  }
}

const processNewBlock = async (microchain: db.Microchain, hash: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const owners = await dbMicrochainOwnerBridge.value?.getMicrochainOwners(microchain.microchain) as db.Owner[]
  if (!owners?.length) return

  const publicKeys = owners.reduce((keys: string[], a): string[] => { keys.push(a.address); return keys }, [])
  try {
    await updateChainAccountBalances(microchain, publicKeys)
    await updateFungibleBalances(microchain, publicKeys)
  } catch (error) {
    console.log('Failed update chain account balances', error)
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const block = await rpcBlockBridge.value?.getBlockWithHash(microchain.microchain, hash) as HashedCertificateValue

  if (window.location.origin.startsWith('http')) {
    try {
      await parseActivities(microchain, block)
    } catch (e) {
      console.log('Failed parse activities', e)
    }
  }
  try {
    await updateChainOperations(microchain, block)
  } catch (e) {
    console.log('Failed update chain operations', e)
  }

  // Here we don't care about the result. If ticker run think they need to run again when fail, they should append themselves again
  const tickerRuns = localStore.operation.tickerRuns
  for (const [id, tickerRun] of tickerRuns) {
    try {
      tickerRun()
    } catch {
      // DO NOTHING
    }
    localStore.operation.tickerRuns.delete(id)
  }
}

const sortedObject = (obj: Record<string, unknown>): Record<string, unknown> => {
  const sortedKeys = Object.keys(obj).sort()
  const _sortedObject: Record<string, unknown> = {}
  for (const key of sortedKeys) {
    const value = obj[key]
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      _sortedObject[key] = sortedObject(value as Record<string, unknown>)
    } else {
      _sortedObject[key] = value
    }
  }

  return _sortedObject
}

const processNewIncomingBundle = async (microchain: string, operation?: rpc.Operation): Promise<{ certificateHash: string, isRetryBlock: boolean }> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    rpcBlockMaterialBridge.value?.getBlockMaterial(microchain).then(async (blockMaterial: CandidateBlockMaterial) => {
      if (!operation && blockMaterial.incomingBundles.length === 0) return resolve({ certificateHash: undefined as unknown as string, isRetryBlock: false })

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const executedBlockMaterial = await rpcExecuteBlockBridge.value?.executeBlockWithFullMaterials(
        microchain,
        operation ? [operation] : [],
        blockMaterial.incomingBundles,
        blockMaterial.localTime
      ) as ExecutedBlockMaterial

      const executedBlock = executedBlockMaterial?.executedBlock
      const validatedBlockCertificateHash = executedBlockMaterial?.validatedBlockCertificateHash as string
      const isRetryBlock = executedBlockMaterial?.retry

      if (!executedBlock) return reject('Failed execute block')

      if (executedBlock.block.operations.length !== (operation ? 1 : 0)) return reject('Invalid operation count')
      if (operation && !isRetryBlock) {
        const executedOperation = executedBlock.block.operations[0] as rpc.Operation
        const operationHash = await sha3(JSON.stringify(sortedObject(operation), (key, value) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          if (value !== null) return value
        }))
        const executedOperationHash = await sha3(JSON.stringify(sortedObject(executedOperation), (key, value) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          if (value !== null) return value
        }))
        if (operationHash !== executedOperationHash) {
          return reject('Invalid operation payload')
        }
      }

      // TODO: we actually should construct block with local rust code but it's too hard now, so we just validate executed block calculated by node service
      //       It has the same security level as local rust code
      // TODO: construct block locally and compare with block in executed block

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      // const stateHash1 = await constructBlock.value?.constructBlock(microchain, operation, blockMaterial.incomingBundles, blockMaterial.localTime)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const block = JSON.parse(JSON.stringify(executedBlock.block), function (this: Record<string, unknown>, key: string, value: unknown) {
        if (value === null) return
        if (key.length && typeof key === 'string' && key.slice(0, 1).toLowerCase() === key.slice(0, 1) && key.toLowerCase() !== key) {
          const _key = toSnake(key)
          if (!_key.includes('_') || _key === key) return value
          if (this) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this[_key] = value
          }
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value
      })

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const payload = await lineraWasm.executed_block_payload(
        JSON.stringify(block, null, 2),
        JSON.stringify(blockMaterial.round),
        ''
      )
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const owner = await dbMicrochainBridge.value?.microchainOwner(microchain) as db.Owner
      if (!owner) reject('Invalid owner')
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const signature = await rpcBlockBridge.value?.signPayload(owner, JSON.parse(payload)) as string
      if (!signature) reject('Failed generate signature')

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const _executedBlock = JSON.parse(JSON.stringify(executedBlock), function (this: Record<string, unknown>, key: string, value: unknown) {
        if (value === null) return
        if (key.length && typeof key === 'string' && key.slice(0, 1).toLowerCase() === key.slice(0, 1) && key.toLowerCase() !== key) {
          const _key = toSnake(key)
          if (!_key.includes('_') || _key === key) return value
          if (this) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            this[_key] = value
          }
          return
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return value
      })

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      rpcBlockBridge.value?.submitBlockAndSignature(
        microchain,
        executedBlock.block.height,
        _executedBlock,
        blockMaterial.round,
        signature,
        isRetryBlock,
        validatedBlockCertificateHash
      ).then((certificateHash: string) => {
        if (operation) {
          localStore.notification.pushNotification({
            Title: t('MSG_EXECUTE_OPERATION'),
            Message: t('MSG_SUCCESS_EXECUTE_OPERATION'),
            Popup: true,
            Type: localStore.notify.NotifyType.Info
          })
        }
        resolve({ certificateHash, isRetryBlock })
      }).catch((error) => {
        console.log('Failed submit block', error)
        if (blockMaterial.incomingBundles.length > 0) {
          setTimeout(() => {
            void processNewIncomingBundle(microchain)
          }, 1000)
        }
        reject(error)
      })
    }).catch((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Fail process incoming bundle: ${error}`)
      reject(error)
    })
  })
}

const subscribeMicrochain = async (microchain: db.Microchain): Promise<() => void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const owners = await dbMicrochainOwnerBridge.value?.getMicrochainOwners(microchain.microchain) as db.Owner[]
  if (!owners.length) return Promise.reject('Invalid owners')

  const publicKeys = owners.reduce((keys: string[], a): string[] => { keys.push(a.address); return keys }, [])
  try {
    await updateChainAccountBalances(microchain, publicKeys)
    await updateFungibleBalances(microchain, publicKeys)
  } catch {
    // DO NOTHING
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return await rpcBlockBridge.value?.subscribe(
    microchain.microchain,
    async () => {
      // DO NOTHING
    }, async (hash: string) => {
      try {
        await processNewBlock(microchain, hash)
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Fail process new block: ${error}`)
      }
    }, async () => {
      if (window.location.origin.startsWith('http')) {
        try {
          await processNewIncomingBundle(microchain.microchain)
        } catch (error) {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`Fail process incoming bundle: ${error}`)
        }
      }
    }) as () => void
}

const subscribeMicrochains = async () => {
  for (const microchain of microchains.value) {
    if (subscribed.value.get(microchain.microchain)) continue
    const stop = await subscribeMicrochain({ ...microchain })
    subscribed.value.set(microchain.microchain, stop)
  }
}

const unsubscribeMicrochains = () => {
  subscribed.value.forEach((stop) => {
    stop()
  })
}

watch(microchains, async () => {
  await subscribeMicrochains()
})

watch(microchainsImportState, async () => {
  switch (microchainsImportState.value) {
    case localStore.settingDef.MicrochainsImportState.MicrochainsImported:
      unsubscribeMicrochains()
      await subscribeMicrochains()
  }
})

const _unmounted = ref(false)

const _handleOperations = async () => {
  if (window.location.origin.startsWith('http')) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const operations = await dbChainOperationBridge.value?.getChainOperations(0, 0, undefined, [db.OperationState.CREATED, db.OperationState.EXECUTING]) as db.ChainOperation[]
    // TODO: merge operations of the same microchain
    for (const operation of operations) {
      const _operation = JSON.parse(operation.operation) as rpc.Operation
      try {
        operation.state = db.OperationState.EXECUTING
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await dbChainOperationBridge.value?.updateChainOperation(operation)
        const { certificateHash, isRetryBlock } = await processNewIncomingBundle(operation.microchain, _operation)
        // TODO: get operation certificate hash
        // We don't know the reason of the failure, so we let user to choose if retry
        // TODO: processNewIncomingBundle return if retry
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (isRetryBlock) continue
        operation.state = db.OperationState.EXECUTED
        operation.certificateHash = certificateHash
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await dbChainOperationBridge.value?.updateChainOperation(operation)
      } catch (error) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Failed process incoming bundle: ${error}`)
        // When fail, don't continue
        continue
      }
    }
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const operations = await dbChainOperationBridge.value?.getChainOperations(0, 0, undefined, [db.OperationState.CONFIRMED]) as db.ChainOperation[]
  for (const operation of operations) {
    const _operation = JSON.parse(operation.operation) as rpc.Operation
    try {
      switch (operation.operationType) {
        case operationDef.OperationType.SUBSCRIBE_CREATOR_CHAIN:
          if (operation.applicationType === db.ApplicationType.ERC20 || operation.applicationType === db.ApplicationType.WLINERA) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await erc20ApplicationOperationBridge.value?.persistApplication(operation.microchain, _operation.User.application_id)
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
          if (await dbApplicationCreatorChainSubscriptionBridge.value?.createApplicationCreatorChainSubscription(operation.microchain, _operation.User.application_id)) {
            operation.state = db.OperationState.POST_PROCESSED
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            await dbChainOperationBridge.value?.updateChainOperation(operation)
          }
          break
        case operationDef.OperationType.REQUEST_APPLICATION:
          if (operation.applicationType === db.ApplicationType.WLINERA) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            if (await erc20ApplicationOperationBridge.value?.subscribeWLineraCreationChain(operation.microchain, true)) {
              operation.state = db.OperationState.POST_PROCESSED
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              await dbChainOperationBridge.value?.updateChainOperation(operation)
            }
          } else if (operation.applicationType === db.ApplicationType.ERC20) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            if (await erc20ApplicationOperationBridge.value?.subscribeCreationChain(operation.microchain, _operation.System.RequestApplication.application_id, true)) {
              operation.state = db.OperationState.POST_PROCESSED
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              await dbChainOperationBridge.value?.updateChainOperation(operation)
            }
          } else if (operation.applicationType === db.ApplicationType.SWAP) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            if (await swapApplicationOperationBridge.value?.subscribeCreationChain(operation.microchain, true)) {
              operation.state = db.OperationState.POST_PROCESSED
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              await dbChainOperationBridge.value?.updateChainOperation(operation)
            }
          } else if (operation.applicationType === db.ApplicationType.AMS) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            if (await amsApplicationOperationBridge.value?.subscribeCreationChain(operation.microchain, true)) {
              operation.state = db.OperationState.POST_PROCESSED
              // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
              await dbChainOperationBridge.value?.updateChainOperation(operation)
            }
          }
          break
      }
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Failed post process operation: ${error}`)
      // When fail, don't continue
      continue
    }
  }
}

const delay = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const handleOperations = async () => {
  while (!_unmounted.value) {
    await _handleOperations()
    await delay(1000)
  }
}

onMounted(async () => {
  await subscribeMicrochains()
  void handleOperations()
})

onUnmounted(() => {
  unsubscribeMicrochains()
  _unmounted.value = true
})

</script>
