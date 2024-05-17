<template>
  <div>
    <q-btn
      v-if='!autoRun'
      outline
      rounded
      label='Create Account'
      @click='onCreateAccountClick'
      class='text-brown-10'
      :style='{
        width: "100%"
      }'
    />
  </div>
</template>

<script setup lang="ts">
import { Berith, Ed25519SigningKey, Memory } from '@hazae41/berith'
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import {
  provideApolloClient,
  useMutation,
  useQuery
} from '@vue/apollo-composable'
import { graphqlResult, _hex, endpoint } from 'src/utils'
import { wallet } from 'src/localstores'
import { onMounted, toRef } from 'vue'

interface Props {
  checkExist?: boolean
  autoRun?: boolean
  password?: string
}

const publicKey = defineModel<string>('publicKey')

const props = defineProps<Props>()
const autoRun = toRef(props, 'autoRun')
const password = toRef(props, 'password')
const checkExist = toRef(props, 'checkExist')

const _wallet = wallet.useWalletStore()

const openChain = async (publicKey: string, done?: (chainId: string, messageId: string) => void) => {
  const options = getClientOptions(endpoint.faucetSchema, endpoint.faucetWsSchema, endpoint.faucetHost, endpoint.faucetPort)
  const apolloClient = new ApolloClient(options)

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation openChain ($publicKey: String!) {
      claim(publicKey: $publicKey) {
        messageId
        chainId
        certificateHash
      }
    }`))
  onDone((res) => {
    done?.(
      graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'chainId') as string,
      graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'messageId') as string
    )
  })
  onError((error) => {
    console.log('Fail open chain for ', publicKey, error)
  })
  await mutate({
    publicKey
  })
}

const initMicrochainChainStore = async (publicKey: string, chainId: string, messageId: string, done?: () => void) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation walletInitWithoutKeypair ($publicKey: String!, $faucetUrl: String!, $chainId: String!, $messageId: String!, $withOtherChains: [String!]!) {
      walletInitWithoutKeypair(publicKey: $publicKey, faucetUrl: $faucetUrl, chainId: $chainId, messageId: $messageId, withOtherChains: $withOtherChains)
    }`))
  onDone(() => {
    done?.()
  })
  onError((error) => {
    console.log('Fail init microchain store for ', publicKey, error)
  })
  await mutate({
    publicKey,
    faucetUrl: endpoint.faucetUrl,
    chainId,
    messageId,
    withOtherChains: []
  })
}

const generateEd25519SigningKey = (done?: (keyPair: Ed25519SigningKey) => void) => {
  Berith.initBundledOnce()
    .then(() => {
      done?.(new Ed25519SigningKey())
    })
    .catch((reason) => {
      console.log('Rejected:', reason)
    })
}

const getPendingRawBlock = (chainId: string, done?: (blockAndRound: unknown) => void) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

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
    const rawBlock = graphqlResult.data(res, 'peekCandidateRawBlockPayload')
    if (!rawBlock) return
    done?.(rawBlock)
  })

  onError((error) => {
    console.log('Get pending block', error)
  })
}

const submitBlockSignature = async (chainId: string, height: number, signature: string, done?: () => void) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation submitBlockSignature ($chainId: String!, $height: Int!, $signature: String!) {
      submitBlockSignature(chainId: $chainId, height: $height, signature: $signature)
    }`))
  onDone(() => {
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

const signNewBlock = (chainId: string, notifiedHeight: number, keyPair: Ed25519SigningKey, done?: () => void) => {
  getPendingRawBlock(chainId, (rawBlockAndRound: unknown) => {
    const payloadBytes = graphqlResult.keyValue(rawBlockAndRound, 'payloadBytes')
    const signature = _hex.toHex(keyPair.sign(new Memory(payloadBytes as Uint8Array)).to_bytes().bytes)
    const height = graphqlResult.keyValue(rawBlockAndRound, 'height') as number
    if (height !== notifiedHeight) {
      console.log('Mismatch block height', height, notifiedHeight)
      return
    }
    void submitBlockSignature(chainId, height, signature, () => {
      done?.()
    })
  })
}

const createAccount = () => {
  generateEd25519SigningKey((keyPair: Ed25519SigningKey) => {
    const _publicKey = _hex.toHex(keyPair.public().to_bytes().bytes)
    const privateKey = _hex.toHex(keyPair.to_bytes().bytes)
    void openChain(_publicKey, (chainId: string, messageId: string) => {
      void initMicrochainChainStore(_publicKey, chainId, messageId, () => {
        signNewBlock(chainId, 0, keyPair, () => {
          void _wallet.addAccount(_publicKey, privateKey, password.value as string, () => {
            _wallet.addChain(_publicKey, chainId, messageId, endpoint.rpcUrl)
            publicKey.value = _publicKey
          }, () => {
            console.log('Invalid password')
          })
        })
      })
    })
  })
}

const onCreateAccountClick = () => {
  createAccount()
}

onMounted(() => {
  if (autoRun.value) {
    if (checkExist.value) {
      _wallet.load(() => {
        if (_wallet.accounts.size > 0) {
          publicKey.value = Array.from(_wallet.accounts.keys())[0]
          return
        }
        createAccount()
      })
      return
    }
    createAccount()
  }
})

</script>
