<template>
  <div>
    <q-btn
      outline
      rounded
      label='Open Chain'
      @click='onOpenChainClick'
      class='text-brown-10'
      :style='{
        width: "100%",
      }'
    />
  </div>
</template>

<script setup lang="ts">
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation, useQuery } from '@vue/apollo-composable'
import { graphqlResult, _hex, endpoint } from 'src/utils'
import { wallet, notify } from 'src/localstores'

const _wallet = wallet.useWalletStore()
const notification = notify.useNotificationStore()

const openChain = async (publicKey: string, done?: (chainId: string, messageId: string, certificateHash: string) => void) => {
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
      graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'messageId') as string,
      graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'certificateHash') as string
    )
  })
  onError((error) => {
    console.log('Fail open chain for ', publicKey, error)
  })
  await mutate({
    publicKey
  })
}

const initMicrochainChainStore = async (publicKey: string, chainId: string, messageId: string, certificateHash: string, done?: () => void) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation walletInitWithoutKeypair ($publicKey: String!, $faucetUrl: String!, $chainId: String!, $messageId: String!, certificateHash: String!) {
      walletInitWithoutKeypair(publicKey: $publicKey, faucetUrl: $faucetUrl, chainId: $chainId, messageId: $messageId, certificateHash: $certificateHash)
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
    certificateHash
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

  onError(() => {
    // console.log('Get pending block', error)
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
  onError(() => {
    // console.log('Fail submit block signature for', chainId, error)
  })
  await mutate({
    chainId,
    height,
    signature
  })
}

const signNewBlock = (chainId: string, notifiedHeight: number, keyPair: Ed25519SigningKey, done?: () => void) => {
  getPendingRawBlock(chainId, (rawBlockAndRound: unknown) => {
    // TODO: here should be wrong
    const payloadBytes = graphqlResult.keyValue(rawBlockAndRound, 'payloadBytes')
    const signature = _hex.toHex(keyPair.sign(new Memory(payloadBytes as Uint8Array)).to_bytes().bytes)
    const height = graphqlResult.keyValue(rawBlockAndRound, 'height') as number
    if (height !== notifiedHeight) {
      console.log('Mismatch block height', height, notifiedHeight)
      return
    }
    void submitBlockSignature(chainId, height, signature, done)
  })
}

const onOpenChainClick = () => {
  if (!_wallet.currentAddress) {
    return
  }
  void openChain(_wallet.currentAddress, (chainId: string, messageId: string, certificateHash: string) => {
    _wallet.addChain(_wallet.currentAddress, chainId, messageId, certificateHash, endpoint.rpcUrl)
    void initMicrochainChainStore(_wallet.currentAddress, chainId, messageId, certificateHash, () => {
      signNewBlock(chainId, 0, Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(_wallet.currentAccount?.privateKey as string))), () => {
        notification.pushNotification({
          Title: 'Open Chain',
          Message: 'Success open microchain.',
          Popup: true,
          Type: notify.NotifyType.Info
        })
      })
    })
  })
}

</script>
