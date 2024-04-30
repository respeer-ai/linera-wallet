<template>
  <q-page padding>
    <div class='row'>
      <q-space />
      <q-btn
        dense
        flat
        label='Create Account'
        @click='onCreateAccountClick'
        class='text-brown-10'
      />
    </div>
  </q-page>
</template>

<script setup lang='ts'>
import { Berith, Ed25519SigningKey, Memory } from '@hazae41/berith'
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation, useQuery } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import * as constant from 'src/const'
import { wallet } from 'src/localstores'

const _wallet = wallet.useWalletStore()
// const currentAccount = computed(() => _wallet.currentAccount)

const toHex = (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')

const openChain = async (publicKey: string, done?: (chainId: string, messageId: string) => void) => {
  const options = getClientOptions(constant.faucetSchema, constant.faucetWsSchema, constant.faucetHost, constant.faucetPort)
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
    console.log('Success open chain ', graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'chainId'), ' for ', publicKey)
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
  const options = getClientOptions(constant.rpcSchema, constant.rpcWsSchema, constant.rpcHost, constant.rpcPort)
  const apolloClient = new ApolloClient(options)

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation walletInitWithoutKeypair ($publicKey: String!, $faucetUrl: String!, $chainId: String!, $messageId: String!, $withOtherChains: [String!]!) {
      walletInitWithoutKeypair(publicKey: $publicKey, faucetUrl: $faucetUrl, chainId: $chainId, messageId: $messageId, withOtherChains: $withOtherChains)
    }`))
  onDone(() => {
    console.log('Success init microchain store for ', publicKey)
    done?.()
  })
  onError((error) => {
    console.log('Fail init microchain store for ', publicKey, error)
  })
  await mutate({
    publicKey,
    faucetUrl: constant.faucetUrl,
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
  const options = getClientOptions(constant.rpcSchema, constant.rpcWsSchema, constant.rpcHost, constant.rpcPort)
  const apolloClient = new ApolloClient(options)

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
  const options = getClientOptions(constant.rpcSchema, constant.rpcWsSchema, constant.rpcHost, constant.rpcPort)
  const apolloClient = new ApolloClient(options)

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

const signNewBlock = (chainId: string, notifiedHeight: number, keyPair: Ed25519SigningKey) => {
  getPendingRawBlock(chainId, (rawBlockAndRound: unknown) => {
    // TODO: here should be wrong
    const blockBytes = graphqlResult.keyValue(rawBlockAndRound, 'blockBytes')
    const signature = toHex(keyPair.sign(new Memory(blockBytes as Uint8Array)).to_bytes().bytes)
    const height = graphqlResult.keyValue(rawBlockAndRound, 'height') as number
    if (height !== notifiedHeight) {
      console.log('Mismatch block height', height, notifiedHeight)
      return
    }
    console.log('Signature', chainId, height, signature, toHex(blockBytes as Uint8Array))
    void submitBlockSignature(chainId, height, signature)
  })
}

const createAccount = () => {
  generateEd25519SigningKey((keyPair: Ed25519SigningKey) => {
    const publicKey = toHex(keyPair.public().to_bytes().bytes)
    const privateKey = toHex(keyPair.to_bytes().bytes)
    void _wallet.addAccount(publicKey, privateKey)
    console.log('Opening chain for ', publicKey, privateKey)
    void openChain(publicKey, (chainId: string, messageId: string) => {
      _wallet.addChain(publicKey, chainId)
      void initMicrochainChainStore(publicKey, chainId, messageId, () => {
        signNewBlock(chainId, 0, keyPair)
      })
    })
  })
}

const onCreateAccountClick = () => {
  createAccount()
}

</script>
