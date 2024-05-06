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

import lineraLogo from '../assets/LineraLogo.png'
import { Berith, Ed25519SigningKey, Memory } from '@hazae41/berith'
import { copyToClipboard } from 'quasar'

const _wallet = wallet.useWalletStore()
const addresses = computed(() => _wallet.publicKeys)
const currentAddress = computed(() => _wallet.currentAddress)
const address = ref(_wallet.currentAddress || addresses.value[0])
const chains = computed(() => _wallet.chains)
const subscriptions = ref(new Map<string, Array<string>>())

const notification = notify.useNotificationStore()

const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
const apolloClient = new ApolloClient(options)

const subscribe = (chainId: string, onNewRawBlock?: (height: number) => void, onNewBlock?: () => void) => {
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
      onNewBlock?.()
    }
  })
}

const signNewBlock = (chainId: string, notifiedHeight: number | undefined, keyPair: Ed25519SigningKey, recursive?: boolean) => {
  getPendingRawBlock(chainId, (rawBlockAndRound: unknown) => {
    if (!rawBlockAndRound) {
      return
    }
    const blockBytes = graphqlResult.keyValue(rawBlockAndRound, 'blockBytes')
    const signature = _hex.toHex(keyPair.sign(new Memory(blockBytes as Uint8Array)).to_bytes().bytes)
    const height = graphqlResult.keyValue(rawBlockAndRound, 'height') as number
    if (notifiedHeight !== undefined && height !== notifiedHeight) {
      return
    }
    void submitBlockSignature(chainId, height, signature, () => {
      if (recursive) signNewBlock(chainId, undefined, keyPair, recursive)
    })
  })
}

const getPendingRawBlock = (chainId: string, done?: (blockAndRound: unknown) => void) => {
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getPendingRawBlock($chainId: String!) {
      peekCandidateBlockAndRound(chainId: $chainId) {
        height
        blockBytes
      }
    }
  `, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    const rawBlock = graphqlResult.data(res, 'peekCandidateBlockAndRound')
    done?.(rawBlock)
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
  onError((/* error */) => {
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

const processChains = () => {
  addresses.value.forEach((addr) => {
    const chains = _wallet.accountChains(addr)
    const account = _wallet.account(addr)
    if (!account) {
      return
    }
    const subscribedChains = subscriptions.value.get(addr)
    chains.forEach((microchain, chainId) => {
      if (subscribedChains?.includes(chainId)) return
      const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(account.privateKey)))
      signNewBlock(chainId, undefined, keyPair, true)
      subscribe(chainId, (height: number) => {
        signNewBlock(chainId, height, keyPair, false)
      }, () => {
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
