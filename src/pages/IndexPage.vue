<template>
  <div class='text-center'>
    Hello world
  </div>
</template>

<script setup lang='ts'>
import { onMounted } from 'vue'
import { Berith, Ed25519SigningKey } from '@hazae41/berith'
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation, useQuery } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'

// const faucetSchema = 'https'
// const faucetHost = 'faucet.devnet.linera.net'
// const faucetPort = 443

const faucetSchema = 'http'
const faucetHost = '172.16.31.73'
const faucetPort = 8080
const faucetUrl = faucetSchema + '://' + faucetHost + ':' + faucetPort.toString()

const rpcSchema = 'http'
const rpcHost = '172.16.31.73'
const rpcPort = 9080

const toHex = (bytes: Uint8Array) => bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '')

const openChain = async (publicKey: string, done?: (chainId: string, messageId: string) => void) => {
  const options = getClientOptions(faucetSchema, faucetHost, faucetPort)
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
  const options = getClientOptions(rpcSchema, rpcHost, rpcPort)
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
    faucetUrl,
    chainId,
    messageId,
    withOtherChains: []
  })
}

const generateEd25519SigningKey = (done?: (publicKey: string) => void) => {
  Berith.initBundledOnce()
    .then(() => {
      const keyPair = new Ed25519SigningKey()
      done?.(toHex(keyPair.public().to_bytes().bytes))
    })
    .catch((reason) => {
      console.log('Rejected:', reason)
    })
}

const getPendingRawBlock = (chainId: string, done?: () => void) => {
  const options = getClientOptions(rpcSchema, rpcHost, rpcPort)
  const apolloClient = new ApolloClient(options)

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getPendingRawBlock($chainId: String!) {
      peekCandidateBlockAndRound(chainId: $chainId) {
        block {
          authenticatedSigner
          previousBlockHash
        }
      }
    }
  `, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    console.log(res)
    done?.()
  })

  onError((error) => {
    console.log(error)
  })
}

const listenNewBlock = (chainId: string) => {
  getPendingRawBlock(chainId)
}

const initWallet = () => {
  generateEd25519SigningKey((publicKey: string) => {
    console.log('Opening chain for ', publicKey)
    void openChain(publicKey, (chainId: string, messageId: string) => {
      void initMicrochainChainStore(publicKey, chainId, messageId, () => {
        setInterval(() => {
          listenNewBlock(chainId)
        }, 5000)
      })
    })
  })
}

onMounted(() => {
  initWallet()
})

</script>
