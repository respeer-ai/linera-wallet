<template>
  <div v-if='addresses.length'>
    <div class='row'>
      <q-icon :name='"img:" + lineraLogo' size='24px' :style='{margin: "12px"}' />
      <q-select
        dense
        v-model='address'
        :options='addresses'
        :style='{ height: "24px" }'
      />
      <q-icon
        name='content_copy'
        size='16px'
        color='grey'
        :style='{
          margin: "16px 8px"
        }'
        class='cursor-pointer'
        @click='onCopyAddressClick'
      />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue'
import { wallet, notify } from 'src/localstores'
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation, useQuery, useSubscription } from '@vue/apollo-composable'
import { graphqlResult, _hex, endpoint } from 'src/utils'
import { Berith, Ed25519SigningKey, Memory } from '@hazae41/berith'
import { copyToClipboard } from 'quasar'

import lineraLogo from '../assets/LineraLogo.png'

const _wallet = wallet.useWalletStore()
const addresses = computed(() => _wallet.publicKeys)
const currentAddress = computed(() => _wallet.currentAddress)
const address = ref(_wallet.currentAddress || addresses.value[0])
const chains = computed(() => _wallet.chains)
const subscriptions = ref(new Map<string, Array<string>>())

const notification = notify.useNotificationStore()

const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
const apolloClient = new ApolloClient(options)

const subscribe = (chainId: string, onNewRawBlock?: (height: number) => void, onNewBlock?: (hash: string) => void) => {
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

  onError((error) => {
    console.log('Get pending block', error)
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
  onError((error) => {
    console.log('Fail submit block signature for', chainId, error)
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

  onError((error) => {
    console.log('Get pending block', error)
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

  onError((error) => {
    console.log('Get pending block', error)
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
          console.log('Fail get chain account balances', e)
        }
      })
    })
  })
}

const getBlockWithHash = (chainId: string, hash: string, done?: (height: number, incomingMessages: Array<graphqlResult.IncomingMessage>) => void) => {
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
              incomingMessages {
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
              messageCounts
              stateHash
              oracleRecords {
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
    const incomingMessages = graphqlResult.keyValue(_block, 'incomingMessages') as Array<graphqlResult.IncomingMessage>
    const height = graphqlResult.keyValue(_block, 'height') as number
    done?.(height, incomingMessages)
  })

  onError((error) => {
    console.log('Get pending block', error)
  })
}

const _getBlockWithHash = (chainId: string, hash: string) => {
  getBlockWithHash(chainId, hash, (height: number, incomingMessages: Array<graphqlResult.IncomingMessage>) => {
    try {
      incomingMessages.forEach((incomingMessage: graphqlResult.IncomingMessage) => {
        if (!incomingMessage.event?.message?.System?.Credit) return
        _wallet.publicKeyFromOwner(incomingMessage.event?.message?.System?.Credit?.source, (fromPublicKey: string | undefined) => {
          _wallet.publicKeyFromOwner(incomingMessage.event?.message?.System?.Credit?.target, (toPublicKey: string | undefined) => {
            _wallet.addActivity(
              incomingMessage.origin.sender,
              fromPublicKey,
              chainId,
              toPublicKey,
              incomingMessage.event?.message?.System?.Credit?.amount,
              height,
              incomingMessage.event?.timestamp,
              incomingMessage.event?.certificate_hash,
              incomingMessage.event?.grant
            )
          })
        })
      })
    } catch (e) {
      console.log('Fail process block', e, hash)
    }
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
      if (subscribedChains.includes(chainId)) return
      subscribedChains.push(chainId)
      subscriptions.value.set(addr, subscribedChains)
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
      })
      getAccountBalance(chainId, addr, (balance: number) => {
        _wallet.setAccountBalance(addr, chainId, balance)
      })
      getAccountBalance(chainId, undefined, (balance: number) => {
        _wallet.setChainBalance(addr, chainId, balance)
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

watch(addresses, () => {
  if (!address.value) {
    address.value = addresses.value[0]
  }
})

watch(chains, () => {
  _wallet.load(() => {
    _processChains()
  })
})

watch(address, () => {
  _wallet.selectAddress(address.value)
})

watch(currentAddress, () => {
  address.value = _wallet.currentAddress
})

onMounted(() => {
  _wallet.load(() => {
    _processChains()
  })
})

const onCopyAddressClick = () => {
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
