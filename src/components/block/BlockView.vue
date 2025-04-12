<template>
  <div>
    <DbMicrochainBridge ref='dbMicrochainBridge' v-model:microchains='microchains' />
    <ConstructBlock ref='constructBlock' />
  </div>
</template>

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { db, rpc } from 'src/model'
import { localStore } from 'src/localstores'
import { sha3 } from 'hash-wasm'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { type ConfirmedBlock, type CandidateBlockMaterial } from 'src/__generated__/graphql/service/graphql'
import { useI18n } from 'vue-i18n'
import { dbBridge, rpcBridge } from 'src/bridge'
import { Round } from 'src/model/rpc/model'
import { parse, stringify } from 'lossless-json'
import { blockWorker } from 'src/worker'

import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import ConstructBlock from './ConstructBlock.vue'

const { t } = useI18n({ useScope: 'global' })

const constructBlock = ref<InstanceType<typeof ConstructBlock>>()

const microchains = ref([] as db.Microchain[])
const microchainsImportState = computed(() => localStore.setting.MicrochainsImportState)
const tokensImportState = computed(() => localStore.setting.TokensImportState)
const microchainCompensates = new Map<string, number>()

type stopFunc = () => void
const subscribed = ref(new Map<string, stopFunc>())

const updateChainBalance = async (microchain: db.Microchain, tokenId: number, balance: number) => {
  const microchainBalance = (await dbBridge.MicrochainFungibleTokenBalance.balance(microchain.microchain, tokenId)) as db.MicrochainFungibleTokenBalance || {
    microchain: microchain.microchain,
    tokenId,
    balance: 0
  } as db.MicrochainFungibleTokenBalance
  microchainBalance.balance = Number(balance)
  microchainBalance.id === undefined
    ? await dbBridge.MicrochainFungibleTokenBalance.create(microchain.microchain, microchainBalance.tokenId, microchainBalance.balance)
    : await dbBridge.MicrochainFungibleTokenBalance.update(microchainBalance)
}

const updateAccountBalance = async (microchain: db.Microchain, tokenId: number, owner: string, balance: number) => {
  const microchainOwnerBalance = (await dbBridge.MicrochainOwnerFungibleTokenBalance.balance(microchain.microchain, owner, tokenId)) as db.MicrochainOwnerFungibleTokenBalance || {
    microchain: microchain.microchain,
    owner,
    tokenId,
    balance: 0
  } as db.MicrochainOwnerFungibleTokenBalance
  microchainOwnerBalance.balance = balance
  microchainOwnerBalance.id === undefined
    ? await dbBridge.MicrochainOwnerFungibleTokenBalance.create(microchain.microchain, owner, tokenId, microchainOwnerBalance.balance)
    : await dbBridge.MicrochainOwnerFungibleTokenBalance.update(microchainOwnerBalance)
}

const updateChainAccountBalances = async (microchain: db.Microchain, owners: string[]) => {
  const balances = await rpcBridge.Account.balances([{
    chainId: microchain.microchain,
    owners: Array.from(owners.map((el) => rpcBridge.Account.accountOwner(el)))
  }])
  if (!balances) return
  if (!balances[microchain.microchain]) return
  const nativeToken = (await dbBridge.Token.native()) as db.Token
  if (!nativeToken) return
  await updateChainBalance(microchain, nativeToken.id as number, Number(balances[microchain.microchain].chainBalance))
  for (const owner of owners) {
    await updateAccountBalance(microchain, nativeToken.id as number, owner, Number(rpcBridge.Account.ownerBalance(balances, microchain.microchain, owner)))
  }
}

const parseActivities = async (microchain: db.Microchain, block: ConfirmedBlock) => {
  const nativeTokenId = (await dbBridge.Token.native())?.id || 1
  for (const bundle of block.block.body.incomingBundles || []) {
    const origin = bundle.origin as rpc.Origin
    for (const message of bundle.bundle.messages) {
      const _message = message.message as rpc.Message
      if (_message?.System?.Credit) {
        await dbBridge.Activity.create(
          microchain.microchain,
          nativeTokenId,
          origin.sender,
          _message?.System?.Credit?.source,
          block.block.header.chainId as string,
          _message?.System?.Credit?.target,
          _message?.System?.Credit?.amount,
          block.block.header.height as number,
          block.block.header.timestamp as number,
          block.hash as string,
          message.grant as string
        )
      } else if (_message?.User) {
        const token = await dbBridge.Token.token(_message.User.applicationId) as db.Token
        const tokenId = token?.id || 2
        const memeMessageStr = await lineraWasm.bcs_deserialize_meme_message(`[${_message.User.bytes.toString()}]`)
        // TODO: it may not be Meme message here, we should deserialize it according to application bytecode
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const memeMessage = parse(memeMessageStr) as rpc.MemeMessage
        if (memeMessage?.Transfer) {
          await dbBridge.Activity.create(
            microchain.microchain,
            tokenId,
            memeMessage.Transfer.from.chainId,
            memeMessage.Transfer.from.owner,
            block.block.header.chainId as string,
            memeMessage.Transfer.to.owner,
            memeMessage.Transfer.amount,
            block.block.header.height as number,
            block.block.header.timestamp as number,
            block.hash as string,
            message.grant as string
          )
        }
      }
    }
  }
  for (const operation of block.block.body.operations || []) {
    const _operation = operation as rpc.Operation
    if (_operation.System?.Transfer) {
      let grant = undefined as unknown as string | undefined
      for (const messages of block.block.body.messages || []) {
        grant = messages.find((el) => {
          const destination = el.destination as rpc.Destination
          const message = el.message as rpc.Message
          return destination?.Recipient === _operation.System?.Transfer?.recipient.Account?.chainId &&
                     message?.System?.Credit?.source === _operation.System?.Transfer.owner &&
                     message?.System?.Credit?.target === _operation?.System.Transfer.recipient?.Account?.owner
        })?.grant as string
        if (grant?.length) break
      }
      await dbBridge.Activity.create(
        microchain.microchain,
        nativeTokenId,
        block.block.header.chainId as string,
        _operation.System.Transfer.owner,
        _operation.System.Transfer.recipient.Account?.chainId as string,
        _operation.System.Transfer.recipient.Account?.owner,
        _operation.System.Transfer.amount,
        block.block.header.height as number,
        block.block.header.timestamp as number,
        block.hash as string,
        grant as string
      )
    }
  }
}

const updateFungibleBalances = async (microchain: db.Microchain, owners: string[]) => {
  const tokens = await dbBridge.Token.fungibles()
  for (const token of tokens) {
    try {
      const balance = await rpcBridge.MemeApplicationOperation.balanceOf(token.applicationId as string, microchain.microchain, rpcBridge.Account.CHAIN) || 0
      await updateChainBalance(microchain, token.id as number, balance)
      for (const owner of owners) {
        try {
          const balance = await rpcBridge.MemeApplicationOperation.balanceOf(token.applicationId as string, microchain.microchain, owner) || 0
          await updateAccountBalance(microchain, token.id as number, owner, balance)
        } catch (e) {
          console.log('Failed process account balance', e)
        }
      }
    } catch (e) {
      console.log('Failed process fungible balance', e)
    }
  }
}

const updateChainOperations = async (microchain: db.Microchain, block: ConfirmedBlock) => {
  const operations = await dbBridge.ChainOperation.chainOperations(
    0,
    0,
    microchain.microchain,
    [db.OperationState.EXECUTING, db.OperationState.EXECUTED],
    block.hash as string
  )
  for (const operation of operations) {
    if (operation.state !== db.OperationState.EXECUTED) {
      return setTimeout(() => {
        void updateChainOperations(microchain, block)
      }, 1000)
    }
    operation.state = db.OperationState.CONFIRMED
    await dbBridge.ChainOperation.update(operation)
  }
}

const updateMicrochainOpenState = async (microchain: db.Microchain, block: ConfirmedBlock) => {
  const _microchain = await dbBridge.Microchain.microchain(microchain.microchain) as db.Microchain
  if (_microchain.state === db.MicrochainState.CLAIMING || !_microchain.openChainCertificateHash) {
    return setTimeout(() => {
      void updateMicrochainOpenState(_microchain, block)
    }, 1000)
  }
  if (_microchain.openChainCertificateHash === block.hash) {
    _microchain.state = db.MicrochainState.CREATED
    await dbBridge.Microchain.update(_microchain)
  }
}

const processNewBlock = async (microchain: db.Microchain, hash?: string) => {
  if (microchain.state === db.MicrochainState.CREATED) {
    const owners = await dbBridge.MicrochainOwner.microchainOwners(microchain.microchain)
    if (!owners?.length) return

    const _owners = owners.reduce((keys: string[], a): string[] => { keys.push(a.owner); return keys }, [])
    try {
      await updateChainAccountBalances(microchain, _owners)
      await updateFungibleBalances(microchain, _owners)
    } catch (error) {
      console.log('Failed update chain account balances', error)
    }
  }

  const block = await rpcBridge.Block.getBlockWithHash(microchain.microchain, hash)
  if (!block) return

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
  try {
    await updateMicrochainOpenState(microchain, block)
  } catch (e) {
    console.log('Failed update chain open state', e)
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

const processNewIncomingBundle = async (microchain: string, _operation?: db.ChainOperation): Promise<{ certificateHash: string, isRetryBlock: boolean }> => {
  const operation = _operation ? parse(_operation.operation) as rpc.Operation : undefined

  if (microchainCompensates.has(microchain)) {
    window.clearTimeout(microchainCompensates.get(microchain))
    microchainCompensates.delete(microchain)
  }

  return new Promise((resolve, reject) => {
    const maxProcessBundles = 2

    rpcBridge.BlockMaterial.getBlockMaterial(microchain, maxProcessBundles).then(async (blockMaterial: CandidateBlockMaterial) => {
      if (!operation && blockMaterial.incomingBundles.length === 0) {
        return resolve({ certificateHash: undefined as unknown as string, isRetryBlock: false })
      }

      const continueProcess = blockMaterial?.incomingBundles?.length >= maxProcessBundles

      const simulatedBlockMaterial = await rpcBridge.SimulatedBlock.simulateExecuteBlock(
        microchain,
        operation ? [operation] : [],
        _operation ? await dbBridge.ChainOperation.operationBlobs(_operation.operationId) : [],
        blockMaterial
      )

      const block = simulatedBlockMaterial?.block
      const validatedBlockCertificate = simulatedBlockMaterial?.validatedBlockCertificate as unknown
      const isRetryBlock = !!validatedBlockCertificate

      if (!block) return reject('Failed execute block')

      if (!isRetryBlock && block.body.operations.length !== (operation ? 1 : 0)) return reject('Invalid operation count')
      if (operation && !isRetryBlock) {
        const executedOperation = block.body.operations[0] as rpc.Operation
        const operationHash = await sha3(stringify(sortedObject(operation), (key, value) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          if (value !== null) return value
        }) as string)
        const executedOperationHash = await sha3(stringify(sortedObject(executedOperation), (key, value) => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          if (value !== null) return value
        }) as string)
        if (operationHash !== executedOperationHash) {
          return reject('Invalid operation payload')
        }
      }

      // TODO: we actually should construct block with local rust code but it's too hard now, so we just validate executed block calculated by node service
      //       It has the same security level as local rust code
      // TODO: construct block locally and compare with block in executed block

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const payload = await lineraWasm.block_payload(
        stringify(block, null, 2) as string,
        stringify(blockMaterial.round) as string,
        stringify(simulatedBlockMaterial.outcome) as string
      )
      const owner = await dbBridge.Microchain.microchainOwner(microchain) as db.Owner
      if (!owner) reject('Invalid owner')
      const signature = await rpcBridge.Block.signPayload(owner, parse(payload) as Uint8Array)
      if (!signature) reject('Failed generate signature')

      if (_operation) {
        _operation.state = db.OperationState.EXECUTING
        await dbBridge.ChainOperation.update(_operation)
      }

      const isOpenChain = stringify(block)?.includes('OpenChain')
      const blobBytes = (isRetryBlock ? (simulatedBlockMaterial.blobBytes || []) : _operation ? await dbBridge.ChainOperation.operationBlobs(_operation.operationId) : [])as Array<Uint8Array>

      rpcBridge.Block.submitBlockAndSignature(
        microchain,
        block.header.height as number,
        block,
        blockMaterial.round as Round,
        signature,
        validatedBlockCertificate,
        blobBytes
      ).then((certificateHash: string) => {
        if (operation) {
          localStore.notification.pushNotification({
            Title: t('MSG_EXECUTE_OPERATION'),
            Message: t('MSG_SUCCESS_EXECUTE_OPERATION'),
            Popup: true,
            Type: localStore.notify.NotifyType.Info
          })
        }
        if (continueProcess) {
          if (microchainCompensates.has(microchain)) {
            window.clearTimeout(microchainCompensates.get(microchain))
            microchainCompensates.delete(microchain)
          }
          microchainCompensates.set(microchain, window.setTimeout(() => {
            processNewIncomingBundle(microchain).then(() => {
              // DO NOTHING
            }).catch((e) => {
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              console.log(`Fail process incoming bundle: ${e}`)
            })
          }, 200))
        }

        if (isOpenChain) {
          dbBridge.Microchain.microchain(microchain).then((_microchain?: db.Microchain) => {
            if (!_microchain) return
            _microchain.state = db.MicrochainState.CLAIMED
            _microchain.openChainCertificateHash = certificateHash
            void dbBridge.Microchain.update(_microchain)
          }).catch((e) => {
            console.log('Failed update mirochain', e)
          })
        }

        resolve({ certificateHash, isRetryBlock })
      }).catch((error) => {
        console.log('Failed submit block', error)
        reject(error)
      })
    }).catch((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Fail process incoming bundle: ${error}`)
      reject(error)
    })
  })
}

const subscribeMicrochain = async (microchain: db.Microchain) => {
  const owners = await dbBridge.MicrochainOwner.microchainOwners(microchain.microchain)
  if (!owners.length) return Promise.reject('Invalid owners')

  const _owners = owners.reduce((keys: string[], a): string[] => { keys.push(a.owner); return keys }, [])
  try {
    await updateChainAccountBalances(microchain, _owners)
    await updateFungibleBalances(microchain, _owners)
  } catch {
    // DO NOTHING
  }

  const unsubscribe = await rpcBridge.Block.subscribe(
    microchain.microchain, (hash: string) => {
      blockWorker.BlockWorker.send(blockWorker.BlockEventType.NEW_BLOCK, {
        microchain: microchain.microchain,
        hash
      })

      processNewBlock(microchain, hash).then(() => {
        // DO NOTHING
      }).catch((e) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Fail process new block: ${e}`)
      })
    }, () => {
      if (window.location.origin.startsWith('http')) {
        processNewIncomingBundle(microchain.microchain).then(() => {
          // DO NOTHING
        }).catch((e) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`Fail process incoming bundle: ${e}`)
        })
      }
    }) as () => void

  try {
    await processNewIncomingBundle(microchain.microchain)
    await processNewBlock(microchain)
  } catch {
    // DO NOTHING
  }

  return unsubscribe
}

const subscribeMicrochains = async () => {
  for (const microchain of microchains.value) {
    if (subscribed.value.get(microchain.microchain)) continue
    try {
      const stop = await subscribeMicrochain({ ...microchain })
      subscribed.value.set(microchain.microchain, stop)
    } catch (e) {
      console.log('Failed subscribe microchain', microchain.microchain, e)
    }
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

const updateMicrochainFungibleBalances = async (microchain: db.Microchain) => {
  const owners = await dbBridge.MicrochainOwner.microchainOwners(microchain.microchain)
  if (!owners.length) return
  const _owners = owners.reduce((keys: string[], a): string[] => { keys.push(a.owner); return keys }, [])
  try {
    await updateFungibleBalances(microchain, _owners)
  } catch {
    // DO NOTHING
  }
}

watch(tokensImportState, async () => {
  switch (tokensImportState.value) {
    case localStore.settingDef.TokensImportState.TokensImported:
      for (const microchain of microchains.value) {
        await updateMicrochainFungibleBalances(microchain)
      }
  }
})

const _unmounted = ref(false)

const _handleOperations = async () => {
  if (!window.location.origin.startsWith('http')) return

  const processedMicrochains = new Map<string, boolean>()
  const operations = await dbBridge.ChainOperation.chainOperations(0, 0, undefined, [db.OperationState.CREATED, db.OperationState.EXECUTING, db.OperationState.EXECUTED])

  // TODO: merge operations of the same microchain
  for (const operation of operations) {
    if (operation.certificateHash && operation.state === db.OperationState.EXECUTED) {
      try {
        const microchain = await dbBridge.Microchain.microchain(operation.microchain) as db.Microchain
        await processNewBlock(microchain, operation.certificateHash)
      } catch (e) {
        // DO NOTHING
      }
      continue
    }

    if (!operation.firstProcessedAt) {
      operation.firstProcessedAt = Date.now()
      await dbBridge.ChainOperation.update(operation)
      console.log(`Operation created at ${operation.createdAt || 0}, processing at ${operation.firstProcessedAt}`)
    }

    processedMicrochains.set(operation.microchain, true)

    try {
      const { certificateHash, isRetryBlock } = await processNewIncomingBundle(operation.microchain, operation)
      // TODO: get operation certificate hash
      // We don't know the reason of the failure, so we let user to choose if retry
      // TODO: processNewIncomingBundle return if retry
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (isRetryBlock) continue
      operation.state = db.OperationState.EXECUTED
      operation.certificateHash = certificateHash
      await dbBridge.ChainOperation.update(operation)
    } catch (e) {
      if (stringify(e)?.includes('Was expecting block height')) {
        continue
      }
      if (stringify(e)?.includes('is out of order compared to previous messages from')) {
        continue
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Failed process incoming bundle: ${e}`)
      if (operation.firstProcessedAt + 10 * 1000 < Date.now()) {
        operation.state = db.OperationState.FAILED
        operation.failedAt = Date.now()
        operation.failReason = stringify(e)
        await dbBridge.ChainOperation.update(operation)
      }
    }
  }
  for (const microchain of microchains.value) {
    if (microchain.openChainCertificateHash && microchain.state !== db.MicrochainState.CREATED) {
      try {
        await processNewBlock(microchain, microchain.openChainCertificateHash)
      } catch (e) {
        // DO NOTHING
      }
    }
    if (!processedMicrochains.get(microchain.microchain)) {
      try {
        await processNewIncomingBundle(microchain.microchain)
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Failed process incoming bundle: ${e}`)
      }
    }
  }
}

const delay = async (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const handleOperations = async () => {
  while (!_unmounted.value) {
    await _handleOperations()
    await delay(10000)
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
