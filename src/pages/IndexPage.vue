<template>
  <div class='text-center'>
    Hello world
  </div>
</template>

<script setup lang='ts'>
import { onMounted } from 'vue'
import { Berith, Ed25519SigningKey, Memory } from '@hazae41/berith'
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
  const options = getClientOptions(rpcSchema, rpcHost, rpcPort)
  const apolloClient = new ApolloClient(options)

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getPendingRawBlock($chainId: String!) {
      peekCandidateBlockAndRound(chainId: $chainId) {
        block {
          chainId
          epoch
          incomingMessages {
            origin
            event
            action
          }
          operations
          height
          timestamp
          authenticatedSigner
          previousBlockHash
        }
        round
      }
    }
  `, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    console.log(graphqlResult.data(res, 'peekCandidateBlockAndRound'))
    done?.(graphqlResult.data(res, 'peekCandidateBlockAndRound'))
  })

  onError((error) => {
    console.log(error, (blockAndRound: unknown) => {
      console.log(blockAndRound)
    })
  })
}

const submitBlockSignature = async (chainId: string, height: number, signature: string, done?: () => void) => {
  const options = getClientOptions(rpcSchema, rpcHost, rpcPort)
  const apolloClient = new ApolloClient(options)

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation submitBlockSignature ($chainId: String!, $height: Int!, $signature: String!) {
      submitBlockSignature(chainId: $chainId, height: $height, signature: $signature)
    }`))
  onDone((res) => {
    console.log('Success submit block signature for', chainId, res)
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

const listenNewBlock = (chainId: string, keyPair: Ed25519SigningKey) => {
  getPendingRawBlock(chainId, (blockAndRound: unknown) => {
    // TODO: here should be wrond
    const bytes = new TextEncoder().encode(JSON.stringify(blockAndRound))
    const signature = toHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)
    const height = graphqlResult.keyValue(graphqlResult.keyValue(blockAndRound, 'block'), 'height') as number
    console.log('Signature', chainId, height, signature)
    void submitBlockSignature(chainId, height, signature)
  })
}

const initWallet = () => {
  generateEd25519SigningKey((keyPair: Ed25519SigningKey) => {
    const publicKey = toHex(keyPair.public().to_bytes().bytes)
    console.log('Opening chain for ', publicKey)
    void openChain(publicKey, (chainId: string, messageId: string) => {
      void initMicrochainChainStore(publicKey, chainId, messageId, () => {
        setInterval(() => {
          listenNewBlock(chainId, keyPair)
        }, 5000)
      })
    })
  })
}

onMounted(() => {
  initWallet()
})

</script>
