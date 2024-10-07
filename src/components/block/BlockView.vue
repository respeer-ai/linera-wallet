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
  </div>
</template>

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { db, rpc } from 'src/model'
import { dbBase } from 'src/controller'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { _hex } from 'src/utils'
import { localStore } from 'src/localstores'
import { sha3 } from 'hash-wasm'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { toSnake } from 'ts-case-convert'

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

const microchains = ref([] as db.Microchain[])
const microchainsImportState = computed(() => localStore.setting.MicrochainsImportState)

type stopFunc = () => void
const subscribed = ref(new Map<string, stopFunc>())

const updateChainAccountBalances = async (microchain: db.Microchain, publicKeys: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const balancesResp = await rpcAccountBridge.value?.getChainAccountBalances([microchain.microchain], publicKeys) as rpc.ChainAccountBalancesResp
  if (!balancesResp[microchain.microchain]) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const nativeToken = (await dbTokenBridge.value?.nativeToken()) as db.Token
  if (!nativeToken) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const microchainBalance = (await dbMicrochainBalanceBridge.value?.microchainFungibleTokenBalance(microchain, nativeToken.id as number)) as db.MicrochainFungibleTokenBalance || {
    microchain: microchain.microchain,
    tokenId: nativeToken.id as number,
    balance: 0
  } as db.MicrochainFungibleTokenBalance
  microchainBalance.balance = Number(balancesResp[microchain.microchain].chain_balance)
  microchainBalance.id === undefined
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    ? await dbMicrochainBalanceBridge.value?.createMicrochainFungibleTokenBalance(microchain, microchainBalance.tokenId, microchainBalance.balance)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    : await dbMicrochainBalanceBridge.value?.updateMicrochainFungibleTokenBalance(microchainBalance)
  for (const publicKey of publicKeys) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const owner = await dbOwnerBridge.value?.publicKey2Owner(publicKey) as string
    if (!owner) return
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const microchainOwnerBalance = (await dbMicrochainOwnerBalanceBridge.value?.microchainOwnerFungibleTokenBalance(microchain.microchain, owner, nativeToken.id as number)) as db.MicrochainOwnerFungibleTokenBalance || {
      microchain: microchain.microchain,
      owner,
      tokenId: nativeToken.id as number,
      balance: 0
    } as db.MicrochainOwnerFungibleTokenBalance
    microchainOwnerBalance.balance = Number(balancesResp[microchain.microchain].account_balances[publicKey])
    microchainOwnerBalance.id === undefined
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      ? await dbMicrochainOwnerBalanceBridge.value?.createMicrochainOwnerFungibleBalance(microchain.microchain, owner, nativeToken.id as number, microchainOwnerBalance.balance)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      : await dbMicrochainOwnerBalanceBridge.value?.updateMicrochainOwnerFungibleBalance(microchainOwnerBalance)
  }
}

const processNewRawBlock = async (microchain: db.Microchain, height: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const owners = await dbMicrochainOwnerBridge.value?.getMicrochainOwners(microchain.microchain) as db.Owner[]
  if (!owners?.length) return

  const password = (await dbBase.passwords.toArray()).find((el) => el.active)
  if (!password) return Promise.reject(new Error('Invalid password'))

  const _password = db.decryptPassword(password)
  // TODO: process multiple owners chain
  const privateKey = db.privateKey(owners[0], _password)
  const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey)))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await rpcBlockBridge.value?.signNewBlock(microchain.microchain, height, keyPair)
}

const processNewBlock = async (microchain: db.Microchain, hash: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const owners = await dbMicrochainOwnerBridge.value?.getMicrochainOwners(microchain.microchain) as db.Owner[]
  if (!owners?.length) return

  const publicKeys = owners.reduce((keys: string[], a): string[] => { keys.push(a.address); return keys }, [])
  await updateChainAccountBalances(microchain, publicKeys)

  await updateChainAccountBalances(microchain, publicKeys)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const blockResp = await rpcBlockBridge.value?.getBlockWithHash(microchain.microchain, hash) as rpc.BlockResp
  for (const bundle of blockResp?.value?.executedBlock?.block?.incomingBundles || []) {
    for (const message of bundle.bundle.messages) {
      if (message.message?.System?.Credit) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await dbActivityBridge.value?.createActivity(
          bundle.origin.sender,
          message.message?.System?.Credit?.source,
          blockResp.value.executedBlock.block.chainId,
          message.message?.System?.Credit?.target,
          message.message?.System?.Credit?.amount,
          blockResp.value.executedBlock.block.height,
          blockResp.value.executedBlock.block.timestamp,
          blockResp.hash,
          message.grant
        )
      }
    }
  }
  for (const operation of blockResp?.value?.executedBlock?.block.operations || []) {
    if (operation.System?.Transfer) {
      let grant = undefined as unknown as string | undefined
      for (const messages of blockResp?.value?.executedBlock?.outcome?.messages || []) {
        grant = messages.find((el) => {
          return el.destination?.Recipient === operation.System.Transfer.recipient.Account?.chain_id &&
                     el.message.source === operation.System.Transfer.owner &&
                     el.message.target === operation.System.Transfer.recipient?.Account?.owner
        })?.grant
        if (grant?.length) break
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await dbActivityBridge.value?.createActivity(
        blockResp.value.executedBlock.block.chainId,
        operation.System.Transfer.owner,
        operation.System.Transfer.recipient.Account.chain_id,
        operation.System.Transfer.recipient.Account.owner,
        operation.System.Transfer.amount,
        blockResp.value.executedBlock.block.height,
        blockResp.value.executedBlock.block.timestamp,
        blockResp.hash,
        grant as string
      )
    }
  }
}

const processNewIncomingBundle = async (microchain: string, operation?: rpc.Operation): Promise<void> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    rpcBlockMaterialBridge.value?.getBlockMaterial(microchain).then(async (blockMaterial: rpc.BlockMaterialResp) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const executedBlock = await rpcExecuteBlockBridge.value?.executeBlockWithFullMaterials(
        microchain,
        operation ? [operation] : [],
        blockMaterial.incomingBundles,
        blockMaterial.localTime
      ) as rpc.ExecuteBlockResp

      if (!executedBlock) return reject('Failed execute block')

      if (executedBlock.block.operations.length !== (operation ? 1 : 0)) return reject('Invalid operation count')
      if (operation) {
        const executedOperation = executedBlock.block.operations[0]
        if (await sha3(JSON.stringify(operation, (key, value) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          if (value !== null) return value
        })) !== await sha3(JSON.stringify(executedOperation, (key, value) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          if (value !== null) return value
        }))) return reject('Invalid operation payload')
      }

      // TODO: we actually should construct block with local rust code but it's too hard now, so we just validate executed block calculated by node service
      //       It has the same security level as local rust code
      // TODO: construct block locally and compare with block in executed block

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      // const stateHash1 = await constructBlock.value?.constructBlock(microchain, operation, blockMaterial.incomingBundles, blockMaterial.localTime)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const block = JSON.parse(JSON.stringify(executedBlock.block), function (this: Record<string, unknown>, key: string, value: unknown) {
        if (value === null) return
        if (key.length && typeof key === 'string' && key.slice(0, 1).toLowerCase() === key.slice(0, 1)) {
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
        if (key.length && typeof key === 'string' && key.slice(0, 1).toLowerCase() === key.slice(0, 1)) {
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
        signature
      ).then(() => {
        if (operation) {
          localStore.notification.pushNotification({
            Title: 'Execute operation',
            Message: 'Success execute operation.',
            Popup: true,
            Type: localStore.notify.NotifyType.Info
          })
        }
      }).catch((error) => {
        localStore.notification.pushNotification({
          Title: 'Execute operation',
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          Message: `Failed execute operation: ${error}.`,
          Popup: true,
          Type: localStore.notify.NotifyType.Error
        })
      })
    }).catch((error) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Fail process incoming bundle: ${error}`)
    })
  })
}

const subscribeMicrochain = async (microchain: db.Microchain): Promise<() => void> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const owners = await dbMicrochainOwnerBridge.value?.getMicrochainOwners(microchain.microchain) as db.Owner[]
  if (!owners.length) return Promise.reject('Invalid owners')

  const publicKeys = owners.reduce((keys: string[], a): string[] => { keys.push(a.address); return keys }, [])
  await updateChainAccountBalances(microchain, publicKeys)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return await rpcBlockBridge.value?.subscribe(
    microchain.microchain,
    async (height: number) => {
      try {
        if (microchain.microchain === 'feeeed172c74027e2675311c4ec3239dbe8e4b4fcf46b12e6f775523a002d64e') {
          await processNewRawBlock(microchain, height)
        }
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Fail process new raw block ${error}`)
      }
    }, async (hash: string) => {
      await processNewBlock(microchain, hash)
    }, async () => {
      await processNewIncomingBundle(microchain.microchain)
    }) as () => void
}

const subscribeMicrochains = async () => {
  for (const microchain of microchains.value) {
    if (subscribed.value.get(microchain.microchain)) continue
    const stop = await subscribeMicrochain({ ...microchain })
    subscribed.value.set(microchain.microchain, stop)
  }
}

const ubsunscribeMicrochains = () => {
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
      ubsunscribeMicrochains()
      await subscribeMicrochains()
  }
})

const handlerOperation = () => {
  localStore.operation.$subscribe((_, state) => {
    for (const [index, operation] of state.operations.entries()) {
      try {
        processNewIncomingBundle(operation.microchain, operation.operation).then(() => {
          state.operations.splice(index, 1)
        }).catch((error) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`Failed process incoming bundle: ${error}`)
          setTimeout(() => {
            handlerOperation()
          }, 1000)
        })
      } catch {
        // DO NOTHING
      }
    }
  })
}

onMounted(async () => {
  await subscribeMicrochains()
  handlerOperation()
})

onUnmounted(() => {
  ubsunscribeMicrochains()
})

</script>
