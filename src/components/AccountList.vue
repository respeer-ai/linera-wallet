<template>
  <div v-if='displayAddresses.length && display'>
    <div class='row'>
      <q-icon
        v-if='showLogo'
        :name='"img:" + lineraLogo'
        size='24px'
        :style='{ margin: "12px" }'
      />
      <q-select
        dense
        v-model='selectedAddress'
        :label='label'
        :options='displayAddresses'
        :style='{ height: "24px" }'
      />
      <q-icon
        name='content_copy'
        size='16px'
        color='grey'
        :style='{
          margin: "16px 8px",
        }'
        class='cursor-pointer'
        @click='onCopyAddressClick'
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { wallet, notify } from 'src/localstores'
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import {
  provideApolloClient,
  useMutation,
  useQuery,
  useSubscription
} from '@vue/apollo-composable'
import { graphqlResult, _hex, endpoint, shortid } from 'src/utils'
import { Berith, Ed25519SigningKey, Memory } from '@hazae41/berith'
import { copyToClipboard } from 'quasar'
import wasmModuleUrl from '../../src-bex/wasm/linera_wasm_bg.wasm?url'
import initWasm from '../../src-bex/wasm/linera_wasm'
import * as lineraWasm from '../../src-bex/wasm/linera_wasm'

import lineraLogo from '../assets/LineraLogo.png'

interface Props {
  showLogo?: boolean
  showDigits?: number
  label?: string
  display?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showLogo: true,
  showDigits: undefined,
  label: undefined,
  display: true
})
const showLogo = toRef(props, 'showLogo')
const showDigits = toRef(props, 'showDigits')
const label = toRef(props, 'label')
const display = toRef(props, 'display')

const _wallet = wallet.useWalletStore()
const addresses = computed(() => _wallet.publicKeys)

interface SelectAddress {
  label: string
  value: string
  originValue: string
}

const displayAddresses = computed(() => addresses.value.map(el => {
  return {
    label: showDigits.value ? shortid.shortId(_wallet.displayAddress(el), showDigits.value) : _wallet.displayAddress(el),
    originValue: el,
    value: showDigits.value ? shortid.shortId(el, showDigits.value) : el
  } as SelectAddress
}))

const addressCount = computed(() => displayAddresses.value.length)
const currentAddress = computed(() => _wallet.currentAddress)
const selectedAddress = ref(displayAddresses.value.find((el) => el.originValue === currentAddress.value) ||
                            displayAddresses.value.find((el) => el) ||
                            undefined as unknown as SelectAddress)
const address = computed(() => selectedAddress.value?.originValue)
const chains = computed(() => _wallet.chains)
const subscriptions = ref(new Map<string, Array<string>>())

const notification = notify.useNotificationStore()

const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
const apolloClient = new ApolloClient(options)

const subscribe = (chainId: string, onNewRawBlock?: (height: number) => void, onNewBlock?: (hash: string) => void, onNewIncomingBundle?: () => void) => {
  const { /* result, refetch, fetchMore, */ onResult /*, onError */ } = provideApolloClient(apolloClient)(() => useSubscription(gql`
    subscription notifications($chainId: String!) {
      notifications(chainId: $chainId)
    }
  `, {
    chainId
  }))

  onResult((res) => {
    const notifications = graphqlResult.data(res, 'notifications')
    const reason = graphqlResult.keyValue(notifications, 'reason')
    const newRawBlock = graphqlResult.keyValue(reason, 'NewRawBlock')
    if (newRawBlock) {
      onNewRawBlock?.(graphqlResult.keyValue(newRawBlock, 'height') as number)
    }
    const newBlock = graphqlResult.keyValue(reason, 'NewBlock')
    if (newBlock) {
      onNewBlock?.(graphqlResult.keyValue(newBlock, 'hash') as string)
    }
    const newIncomingBundle = graphqlResult.keyValue(reason, 'NewIncomingBundle')
    if (newIncomingBundle) {
      onNewIncomingBundle?.()
    }
  })
}

const signNewBlock = (chainId: string, notifiedHeight: number | undefined, keyPair: Ed25519SigningKey, recursive?: boolean, done?: () => void) => {
  getPendingRawBlock(chainId, (rawBlockPayload: unknown) => {
    if (!rawBlockPayload) {
      done?.()
      return
    }
    const payloadBytes = graphqlResult.keyValue(rawBlockPayload, 'payloadBytes')
    const signature = _hex.toHex(keyPair.sign(new Memory(payloadBytes as Uint8Array)).to_bytes().bytes)
    const height = graphqlResult.keyValue(rawBlockPayload, 'height') as number
    if (notifiedHeight !== undefined && height !== notifiedHeight) {
      return
    }
    void submitBlockSignature(chainId, height, signature, () => {
      if (recursive) signNewBlock(chainId, undefined, keyPair, recursive, done)
    })
  })
}

const getPendingRawBlock = (chainId: string, done?: (rawBlockPayload: unknown) => void) => {
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getPendingRawBlock($chainId: String!) {
      peekCandidateRawBlockPayload(chainId: $chainId) {
        height
        payloadBytes
      }
    }
  `, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    try {
      const rawBlock = graphqlResult.data(res, 'peekCandidateRawBlockPayload')
      done?.(rawBlock)
    } catch (e) {
      console.log('Fail process pending raw block', e)
    }
  })

  onError(() => {
    // console.log('Get pending block', error)
  })
}

const submitBlockSignature = async (chainId: string, height: number, signature: string, done?: () => void) => {
  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation submitBlockSignature ($chainId: String!, $height: Int!, $signature: String!) {
      submitBlockSignature(chainId: $chainId, height: $height, signature: $signature)
    }`))
  onDone(() => {
    console.log('Success submit block signature for', chainId)
    done?.()
  })
  onError(() => {
    // console.log('Fail submit block signature for', chainId, error)
  })
  await mutate({
    chainId,
    height,
    signature
  })
}

const getAccountBalance = (chainId: string, publicKey?: string, done?: (balance: number) => void) => {
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getAccountBalance($chainId: String!, $publicKey: String) {
      balance(chainId: $chainId, publicKey: $publicKey)
    }
  `, {
    chainId,
    publicKey
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    done?.(graphqlResult.data(res, 'balance') as number)
  })

  onError(() => {
    // console.log('Get pending block', error)
  })
}

interface ChainAccountBalances {
  chain_balance: number
  account_balances: Record<string, number>
}

const getChainAccountBalances = (done: (balances: Record<string, ChainAccountBalances>) => void) => {
  const chainIds = _wallet.chainIds
  const publicKeys = _wallet.publicKeys

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getChainAccountBalances($chainIds: [String!]!, $publicKeys: [String!]!) {
      balances(chainIds: $chainIds, publicKeys: $publicKeys)
    }
  `, {
    chainIds,
    publicKeys
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    done?.(graphqlResult.data(res, 'balances') as Record<string, ChainAccountBalances>)
  })

  onError(() => {
    // console.log('Get pending block', error)
  })
}

const _getChainAccountBalances = () => {
  getChainAccountBalances((balances: Record<string, ChainAccountBalances>) => {
    Object.keys(balances).forEach((chainId: string) => {
      const chainBalance = balances[chainId]
      Object.keys(chainBalance?.account_balances).forEach((publicKey: string) => {
        const balance = chainBalance?.account_balances[publicKey]
        try {
          _wallet.setChainBalance(publicKey, chainId, chainBalance.chain_balance)
          _wallet.setAccountBalance(publicKey, chainId, balance)
        } catch (e) {
          // console.log('Fail get chain account balances', e)
        }
      })
    })
  })
}

const getBlockWithHash = (chainId: string, hash: string, done?: (height: number, incomingBundles: Array<graphqlResult.IncomingBundle>) => void) => {
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query block($chainId: String!, $hash: String!) {
      block(chainId: $chainId, hash: $hash) {
        hash
        value {
          status
          executedBlock {
            block {
              chainId
              epoch
              incomingBundles {
                origin
                action
                event
              }
              operations
              height
              timestamp
              authenticatedSigner
              previousBlockHash
            }
            outcome {
              messages {
                destination
                authenticatedSigner
                grant
                refundGrantTo
                kind
                message
              }
              stateHash
              oracleResponses {
                responses
              }
            }
          }
        }
      }
    }
  `, {
    chainId,
    hash
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    const block = graphqlResult.data(res, 'block')
    const value = graphqlResult.keyValue(block, 'value')
    const executedBlock = graphqlResult.keyValue(value, 'executedBlock')
    const _block = graphqlResult.keyValue(executedBlock, 'block')
    const incomingBundles = graphqlResult.keyValue(_block, 'incomingBundles') as Array<graphqlResult.IncomingBundle>
    const height = graphqlResult.keyValue(_block, 'height') as number
    done?.(height, incomingBundles)
  })

  onError(() => {
    // console.log('Get pending block', error)
  })
}

const _getBlockWithHash = (chainId: string, hash: string) => {
  getBlockWithHash(chainId, hash, (height: number, incomingBundles: Array<graphqlResult.IncomingBundle>) => {
    try {
      incomingBundles.forEach((incomingBundle: graphqlResult.IncomingBundle) => {
        if (!incomingBundle.event?.message?.System?.Credit) return
        _wallet.publicKeyFromOwner(incomingBundle.event?.message?.System?.Credit?.source, (fromPublicKey: string | undefined) => {
          _wallet.publicKeyFromOwner(incomingBundle.event?.message?.System?.Credit?.target, (toPublicKey: string | undefined) => {
            _wallet.addActivity(
              incomingBundle.origin.sender,
              fromPublicKey,
              chainId,
              toPublicKey,
              incomingBundle.event?.message?.System?.Credit?.amount,
              height,
              incomingBundle.event?.timestamp,
              incomingBundle.event?.certificate_hash,
              incomingBundle.event?.grant
            )
          })
        })
      })
    } catch (e) {
      console.log('Fail process block', e, hash)
    }
  })
}

const initMicrochainChainStore = async (publicKey: string, signature: string, chainId: string, messageId: string, certificateHash: string, done?: () => void) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation walletInitWithoutKeypair ($publicKey: String!, $signature: String!, $faucetUrl: String!, $chainId: String!, $messageId: String!, $certificateHash: String!) {
      walletInitWithoutKeypair(publicKey: $publicKey, signature: $signature, faucetUrl: $faucetUrl, chainId: $chainId, messageId: $messageId, certificateHash: $certificateHash)
    }`))
  onDone(() => {
    done?.()
  })
  onError((error) => {
    console.log('Fail init microchain store for ', publicKey, error)
  })
  await mutate({
    publicKey,
    signature,
    faucetUrl: endpoint.faucetLocalUrl,
    chainId,
    messageId,
    certificateHash
  })
}

const getPendingMessages = (chainId: string, done?: (messages: Array<graphqlResult.IncomingBundle>) => void) => {
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getPendingMessages($chainId: String!) {
      pendingMessages(chainId: $chainId) {
        action
        origin
        bundle
      }
    }
  `, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    console.log('Get pending messages: ', res)
    done?.(graphqlResult.data(res, 'pendingMessages') as Array<graphqlResult.IncomingBundle>)
  })

  onError((error) => {
    console.log('Get pending messages', error)
  })
}

const getChain = (chainId: string, done?: (nextBlockHeight: number, blockHash: string, adminId: string, timestamp: number, executionStateHash: string) => void) => {
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query chain($chainId: String!) {
      chain(chainId: $chainId) {
        chainId
        executionState {
          system {
            description
            epoch
            adminId
            subscriptions {
              chainId
              name
            }
            ownership
            balance
            timestamp
          }
        }
        executionStateHash
        tipState {
          blockHash
          nextBlockHeight
        }
        manager
        confirmedLog {
          entries
        }
        receivedLog {
          entries {
            chainId
            height
          }
        }
      }
    }
  `, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    console.log('Get chain messages: ', res)
    const chain = graphqlResult.data(res, 'chain')
    const tipState = graphqlResult.keyValue(chain, 'tipState')
    const nextBlockHeight = graphqlResult.keyValue(tipState, 'nextBlockHeight') as number
    const blockHash = graphqlResult.keyValue(tipState, 'blockHash') as string
    const executionState = graphqlResult.keyValue(chain, 'executionState')
    const system = graphqlResult.keyValue(executionState, 'system')
    const adminId = graphqlResult.keyValue(system, 'adminId') as string
    const timestamp = graphqlResult.keyValue(system, 'timestamp') as number
    const executionStateHash = graphqlResult.keyValue(chain, 'executionStateHash') as string
    done?.(nextBlockHeight, blockHash, adminId, timestamp, executionStateHash)
  })

  onError((error) => {
    console.log('Get chain messages', error)
  })
}

const getChainInfo = (chainId: string, done?: (nodeChainInfo: graphqlResult.NodeChainInfo) => void) => {
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query nodeChainInfo($chainId: String!) {
      nodeChainInfo(chainId: $chainId) {
        chainId
        epoch
        manager {
          ownership {
            superOwners
            owners
            multiLeaderRounds
            timeoutConfig {
              fallbackDuration
              baseTimeout
              timeoutIncrement
              fallbackDuration
            }
          }
          leader
          currentRound
        }
        chainBalance
        blockHash
        timestamp
        nextBlockHeight
      }
    }
  `, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    console.log('Get chain info: ', res)
    const nodeChainInfo = graphqlResult.data(res, 'nodeChainInfo')
    const chainId = graphqlResult.keyValue(nodeChainInfo, 'chainId')
    const epoch = graphqlResult.keyValue(nodeChainInfo, 'epoch')
    const chainBalance = graphqlResult.keyValue(nodeChainInfo, 'chainBalance')
    const blockHash = graphqlResult.keyValue(nodeChainInfo, 'blockHash')
    const timestamp = graphqlResult.keyValue(nodeChainInfo, 'timestamp')
    const nextBlockHeight = graphqlResult.keyValue(nodeChainInfo, 'nextBlockHeight') as number
    const manager = graphqlResult.keyValue(nodeChainInfo, 'manager')
    const ownership = graphqlResult.keyValue(manager, 'ownership')
    const leader = graphqlResult.keyValue(manager, 'leader') as graphqlResult.Owner
    const currentRound = graphqlResult.keyValue(manager, 'currentRound')
    const superOwners = graphqlResult.keyValue(ownership, 'superOwners') as graphqlResult.Owner
    const owners = graphqlResult.keyValue(ownership, 'owners') as graphqlResult.Owner
    const multiLeaderRounds = graphqlResult.keyValue(ownership, 'multiLeaderRounds') as number
    const timeoutConfig = graphqlResult.keyValue(ownership, 'timeoutConfig')
    const fastRoundDuration = graphqlResult.keyValue(timeoutConfig, 'fastRoundDuration') as number
    const baseTimeout = graphqlResult.keyValue(timeoutConfig, 'baseTimeout') as number
    const timeoutIncrement = graphqlResult.keyValue(timeoutConfig, 'timeoutIncrement') as number
    const fallbackDuration = graphqlResult.keyValue(timeoutConfig, 'fallbackDuration') as number

    const resultTimeoutConfig = {
      fast_round_duration: fastRoundDuration,
      base_timeout: baseTimeout,
      timeout_increment: timeoutIncrement,
      fallback_duration: fallbackDuration
    } as graphqlResult.TimeoutConfig

    const resultOwnership = {
      super_owners: superOwners,
      owners: owners,
      multi_leader_rounds: multiLeaderRounds,
      timeout_config: resultTimeoutConfig
    } as graphqlResult.NodeChainOwnership

    const resultManager = {
      ownership: resultOwnership,
      leader: leader,
      current_round: currentRound
    } as graphqlResult.NodeChainManagerInfo

    const result = {
      chain_id: chainId,
      epoch: epoch,
      manager: resultManager,
      chain_balance: chainBalance,
      block_hash: blockHash,
      timestamp: timestamp,
      next_block_height: nextBlockHeight
    } as graphqlResult.NodeChainInfo
    done?.(result)
  })

  onError((error) => {
    console.log('Get chain messages', error)
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const constructNewBlockWithIncomingBundles = (chainId: string, keyPair: Ed25519SigningKey) => {
  getChainInfo(chainId, (nodeChainInfo: graphqlResult.NodeChainInfo) => {
    getPendingMessages(chainId, (messages: Array<graphqlResult.IncomingBundle>) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      fetch(wasmModuleUrl).then((buffer) => {
        initWasm(buffer).then(() => {
          getChain(chainId, (nextBlockHeight: number, blockHash: string, adminId: string, timestamp: number, executionStateHash: string) => {
            lineraWasm.execute_operation_with_messages_no_storage(chainId, '', JSON.stringify(messages), JSON.stringify(nodeChainInfo), executionStateHash, _wallet.publicKeys[0], nextBlockHeight.toString(), blockHash, adminId, timestamp.toString()).then((signedMsg) => {
              console.log('signedMsg: ', signedMsg)
            }).catch((error) => {
              console.log('execute_operation_with_messages', error)
            })
          })
        }).catch(() => {
          // TODO
        })
      }).catch(() => {
        // TODO
      })
    })
  })
}

const processChains = () => {
  addresses.value.forEach((addr) => {
    const chains = _wallet.accountChains(addr)
    const account = _wallet.account(addr)
    if (!account) {
      return
    }
    let subscribedChains = subscriptions.value.get(addr)
    if (!subscribedChains) {
      subscribedChains = []
    }
    chains.forEach((microchain, chainId) => {
      if (subscribedChains?.includes(chainId)) return
      subscribedChains?.push(chainId)
      subscriptions.value.set(addr, subscribedChains as [])
      const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(account.privateKey)))
      const typeNameBytes = new TextEncoder().encode('Nonce::')
      const bytes = new Uint8Array([...typeNameBytes, ..._hex.toBytes(microchain.certificate_hash)])
      const signature = _hex.toHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)
      void initMicrochainChainStore(addr, signature, chainId, microchain.message_id, microchain.certificate_hash, () => {
        const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(account.privateKey)))
        signNewBlock(chainId, undefined, keyPair, true, () => {
          _getChainAccountBalances()
        })
        subscribe(chainId, (height: number) => {
          // We must reinitialize key here due to the last one may be disposed
          const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(account.privateKey)))
          signNewBlock(chainId, height, keyPair, false)
        }, (hash: string) => {
          _getChainAccountBalances()
          _getBlockWithHash(chainId, hash)
        }, () => {
          const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(account.privateKey)))
          constructNewBlockWithIncomingBundles(chainId, keyPair)
        })
        getAccountBalance(chainId, addr, (balance: number) => {
          _wallet.setAccountBalance(addr, chainId, balance)
        })
        getAccountBalance(chainId, undefined, (balance: number) => {
          _wallet.setChainBalance(addr, chainId, balance)
        })
      })
    })
  })
}

const _processChains = () => {
  Berith.initBundledOnce()
    .then(() => {
      processChains()
    })
    .catch((reason) => {
      console.log('Rejected:', reason)
    })
}

watch(chains, () => {
  _processChains()
})

watch([addressCount, currentAddress], () => {
  if (selectedAddress.value) return
  selectedAddress.value = displayAddresses.value.find((el) => el.originValue === currentAddress.value) ||
                          displayAddresses.value.find((el) => el) ||
                          undefined as unknown as SelectAddress
})

watch(address, () => {
  if (!address.value || address.value === currentAddress.value) return
  _wallet.selectAddress(address.value)
})

onMounted(() => {
  _processChains()
  if (!currentAddress.value && selectedAddress.value) {
    _wallet.selectAddress(selectedAddress.value.originValue)
  }
})

const onCopyAddressClick = () => {
  if (!address.value) return
  copyToClipboard(address.value)
    .then(() => {
      notification.pushNotification({
        Title: 'Copy Address',
        Message: `Success copy address ${address.value} to clipboard.`,
        Popup: true,
        Type: notify.NotifyType.Info
      })
    })
    .catch((e) => {
      console.log('Fail copy address', e)
    })
}
</script>
<style scoped lang="sass">
</style>
