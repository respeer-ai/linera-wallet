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
import { toSnake } from 'ts-case-convert'
import { type HashedCertificateValue, type CandidateBlockMaterial, type ExecutedBlock } from 'src/__generated__/graphql/service/graphql'
import { useI18n } from 'vue-i18n'
import { dbBridge, rpcBridge } from 'src/bridge'
import { Round } from 'src/model/rpc/model'
import { parse, stringify } from 'lossless-json'

import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import ConstructBlock from './ConstructBlock.vue'

const { t } = useI18n({ useScope: 'global' })

const constructBlock = ref<InstanceType<typeof ConstructBlock>>()

const microchains = ref([] as db.Microchain[])
const microchainsImportState = computed(() => localStore.setting.MicrochainsImportState)
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

const updateAccountBalance = async (microchain: db.Microchain, tokenId: number, publicKey: string, balance: number) => {
  const owner = await dbBridge.Owner.publicKey2Owner(publicKey) as string
  if (!owner) return
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

const updateChainAccountBalances = async (microchain: db.Microchain, publicKeys: string[]) => {
  const balancesResp = await rpcBridge.Account.getChainAccountBalances([microchain.microchain], publicKeys)
  if (!balancesResp[microchain.microchain]) return
  const nativeToken = (await dbBridge.Token.native()) as db.Token
  if (!nativeToken) return
  await updateChainBalance(microchain, nativeToken.id as number, Number(balancesResp[microchain.microchain].chain_balance))
  for (const publicKey of publicKeys) {
    await updateAccountBalance(microchain, nativeToken.id as number, publicKey, Number(balancesResp[microchain.microchain].account_balances[publicKey]))
  }
}

const parseActivities = async (microchain: db.Microchain, block: HashedCertificateValue) => {
  const nativeTokenId = (await dbBridge.Token.native())?.id || 1
  for (const bundle of block?.value?.executedBlock?.block?.incomingBundles || []) {
    const origin = bundle.origin as rpc.Origin
    for (const message of bundle.bundle.messages) {
      const _message = message.message as rpc.Message
      if (_message?.System?.Credit) {
        await dbBridge.Activity.create(
          microchain.microchain,
          nativeTokenId,
          origin.sender,
          _message?.System?.Credit?.source,
          block.value.executedBlock?.block.chainId as string,
          _message?.System?.Credit?.target,
          _message?.System?.Credit?.amount,
          block.value.executedBlock?.block.height as number,
          block.value.executedBlock?.block.timestamp as number,
          block.hash as string,
          message.grant as string
        )
      } else if (_message?.User) {
        const token = await dbBridge.Token.token(_message.User.application_id) as db.Token
        const tokenId = token?.id || 2
        const erc20MessageStr = await lineraWasm.bcs_deserialize_erc20_message(`[${_message.User.bytes.toString()}]`)
        // TODO: it may not be ERC20 message here, we should deserialize it according to application bytecode
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const erc20Message = parse(erc20MessageStr) as rpc.ERC20Message
        if (erc20Message?.Transfer) {
          await dbBridge.Activity.create(
            microchain.microchain,
            tokenId,
            erc20Message.Transfer.origin.chain_id,
            erc20Message.Transfer.origin.owner,
            block.value.executedBlock?.block.chainId as string,
            erc20Message.Transfer.to.owner,
            erc20Message.Transfer.amount,
            block.value.executedBlock?.block.height as number,
            block.value.executedBlock?.block.timestamp as number,
            block.hash as string,
            message.grant as string
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
          return destination?.Recipient === _operation.System?.Transfer?.recipient.Account?.chain_id &&
                     message?.System?.Credit?.source === _operation.System?.Transfer.owner &&
                     message?.System?.Credit?.target === _operation?.System.Transfer.recipient?.Account?.owner
        })?.grant as string
        if (grant?.length) break
      }
      await dbBridge.Activity.create(
        microchain.microchain,
        nativeTokenId,
        block.value.executedBlock?.block.chainId as string,
        _operation.System.Transfer.owner,
        _operation.System.Transfer.recipient.Account?.chain_id as string,
        _operation.System.Transfer.recipient.Account?.owner,
        _operation.System.Transfer.amount,
        block.value.executedBlock?.block.height as number,
        block.value.executedBlock?.block.timestamp as number,
        block.hash as string,
        grant as string
      )
    }
  }
}

const updateFungibleBalances = async (microchain: db.Microchain, publicKeys: string[]) => {
  const applications = await rpcBridge.Application.microchainApplications(microchain.microchain)
  const tokens = (await dbBridge.Token.fungibles()).filter((token) => applications.findIndex((el) => el.id === token.applicationId) >= 0)
  for (const token of tokens) {
    try {
      const balance = await rpcBridge.ERC20ApplicationOperation.balanceOf(microchain.microchain, token.applicationId as string) || 0
      await updateChainBalance(microchain, token.id as number, balance)
      for (const publicKey of publicKeys) {
        try {
          const balance = await rpcBridge.ERC20ApplicationOperation.balanceOf(microchain.microchain, token.applicationId as string, publicKey) || 0
          await updateAccountBalance(microchain, token.id as number, publicKey, balance)
        } catch (e) {
          console.log('Failed process account balance', e)
        }
      }
    } catch (e) {
      console.log('Failed process fungible balance', e)
    }
  }
}

const updateChainOperations = async (microchain: db.Microchain, block: HashedCertificateValue) => {
  const operations = await dbBridge.ChainOperation.chainOperations(
    0,
    0,
    microchain.microchain,
    [db.OperationState.EXECUTING, db.OperationState.EXECUTED],
    (block.value.executedBlock?.outcome.stateHash || (block.value.executedBlock?.outcome as unknown as Record<string, string>).state_hash) as string
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

const updateMicrochainOpenState = async (microchain: db.Microchain, block: HashedCertificateValue) => {
  if (microchain.openChainCertificateHash === block.hash) {
    microchain.opened = true
    await dbBridge.Microchain.update(microchain)
  }
}

const processNewBlock = async (microchain: db.Microchain, hash?: string) => {
  const owners = await dbBridge.MicrochainOwner.microchainOwners(microchain.microchain)
  if (!owners?.length) return

  const publicKeys = owners.reduce((keys: string[], a): string[] => { keys.push(a.address); return keys }, [])
  try {
    await updateChainAccountBalances(microchain, publicKeys)
    await updateFungibleBalances(microchain, publicKeys)
  } catch (error) {
    console.log('Failed update chain account balances', error)
  }

  const block = await rpcBridge.Block.getBlockWithHash(microchain.microchain, hash)

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

      const executedBlockMaterial = await rpcBridge.ExecutedBlock.executeBlockWithFullMaterials(
        microchain,
        operation ? [operation] : [],
        blockMaterial.incomingBundles,
        blockMaterial.localTime as number
      )

      const executedBlock = executedBlockMaterial?.executedBlock
      const validatedBlockCertificateHash = executedBlockMaterial?.validatedBlockCertificateHash as string
      const isRetryBlock = executedBlockMaterial?.retry

      if (!executedBlock) return reject('Failed execute block')

      if (!isRetryBlock && executedBlock.block.operations.length !== (operation ? 1 : 0)) return reject('Invalid operation count')
      if (operation && !isRetryBlock) {
        const executedOperation = executedBlock.block.operations[0] as rpc.Operation
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

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      // const stateHash1 = await constructBlock.value?.constructBlock(microchain, operation, blockMaterial.incomingBundles, blockMaterial.localTime)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const block = parse(stringify(executedBlock.block) as string, function (this: Record<string, unknown>, key: string, value: unknown) {
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
        stringify(block, null, 2) as string,
        stringify(blockMaterial.round) as string,
        ''
      )
      const owner = await dbBridge.Microchain.microchainOwner(microchain) as db.Owner
      if (!owner) reject('Invalid owner')
      const signature = await rpcBridge.Block.signPayload(owner, parse(payload) as Uint8Array)
      if (!signature) reject('Failed generate signature')

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const _executedBlock = parse(stringify(executedBlock) as string, function (this: Record<string, unknown>, key: string, value: unknown) {
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
      }) as ExecutedBlock

      if (_operation) {
        _operation.state = db.OperationState.EXECUTING
        _operation.stateHash = (_executedBlock.outcome.stateHash ||
          (_executedBlock.outcome as unknown as Record<string, string>)
            .state_hash) as string
        await dbBridge.ChainOperation.update(_operation)
      }

      const isOpenChain = stringify(_executedBlock)?.includes('OpenChain')

      rpcBridge.Block.submitBlockAndSignature(
        microchain,
        executedBlock.block.height as number,
        _executedBlock,
        blockMaterial.round as Round,
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
            _microchain.opening = true
            _microchain.openChainCertificateHash = certificateHash
            void dbBridge.Microchain.update(_microchain)
          }).catch((e) => {
            console.log('Failed update mirochain', e)
          })
        }

        resolve({ certificateHash, isRetryBlock })
      }).catch((error) => {
        console.log('Failed submit block', error)
        if (blockMaterial.incomingBundles.length > 0) {
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
          }, 1000))
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

const subscribeMicrochain = async (microchain: db.Microchain) => {
  const owners = await dbBridge.MicrochainOwner.microchainOwners(microchain.microchain)
  if (!owners.length) return Promise.reject('Invalid owners')

  const publicKeys = owners.reduce((keys: string[], a): string[] => { keys.push(a.address); return keys }, [])
  try {
    await updateChainAccountBalances(microchain, publicKeys)
    await updateFungibleBalances(microchain, publicKeys)
  } catch {
    // DO NOTHING
  }

  const unsubscribe = await rpcBridge.Block.subscribe(
    microchain.microchain,
    () => {
      // DO NOTHING
    }, (hash: string) => {
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
    const operations = await dbBridge.ChainOperation.chainOperations(0, 0, undefined, [db.OperationState.CREATED, db.OperationState.EXECUTING])
    // TODO: merge operations of the same microchain
    for (const operation of operations) {
      if (!operation.firstProcessedAt) {
        operation.firstProcessedAt = Date.now()
        console.log(`Operation created at ${operation.createdAt || 0}, processing at ${operation.firstProcessedAt}`)
      }

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
