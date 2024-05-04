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
import { graphqlResult, _hex } from 'src/utils'
import * as constant from 'src/const'

import lineraLogo from '../assets/LineraLogo.png'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { copyToClipboard } from 'quasar'

const _wallet = wallet.useWalletStore()
const addresses = computed(() => _wallet.publicKeys)
const currentAddress = computed(() => _wallet.currentAddress)
const address = ref(_wallet.currentAddress || addresses.value[0])
const chains = computed(() => _wallet.currentChains)
const subscriptions = ref(new Map<string, Array<string>>())

const notification = notify.useNotificationStore()

const options = getClientOptions(constant.rpcSchema, constant.rpcWsSchema, constant.rpcHost, constant.rpcPort)
const apolloClient = new ApolloClient(options)

const subscribe = (chainId: string, onNewRawBlock?: (height: number) => void) => {
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
    // TODO: if new block notified, get account balances
  })
}

const signNewBlock = (chainId: string, notifiedHeight: number, keyPair: Ed25519SigningKey) => {
  getPendingRawBlock(chainId, (rawBlockAndRound: unknown) => {
    // TODO: here should be wrong
    const blockBytes = graphqlResult.keyValue(rawBlockAndRound, 'blockBytes')
    const signature = _hex.toHex(keyPair.sign(new Memory(blockBytes as Uint8Array)).to_bytes().bytes)
    const height = graphqlResult.keyValue(rawBlockAndRound, 'height') as number
    if (height !== notifiedHeight) {
      return
    }
    void submitBlockSignature(chainId, height, signature)
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
    if (!rawBlock) return
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
      subscribe(chainId, (height: number) => {
        signNewBlock(chainId, height, Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(account.privateKey))))
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

watch(addresses, () => {
  if (!address.value) {
    address.value = addresses.value[0]
  }
})

watch(chains, () => {
  processChains()
})

watch(address, () => {
  _wallet.selectAddress(address.value)
})

watch(currentAddress, () => {
  address.value = _wallet.currentAddress
})

onMounted(() => {
  _wallet.load(() => {
    processChains()
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
