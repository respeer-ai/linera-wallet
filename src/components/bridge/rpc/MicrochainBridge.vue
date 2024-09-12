<script setup lang='ts'>
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { graphqlResult, endpoint } from 'src/utils'
import { rpc } from 'src/model'

const openChain = async (publicKey: string): Promise<rpc.OpenChainResp> => {
  const options = getClientOptions(endpoint.faucetSchema, endpoint.faucetWsSchema, endpoint.faucetPublicHost, endpoint.faucetPort)
  const apolloClient = new ApolloClient(options)

  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation openChain ($publicKey: String!) {
      claim(publicKey: $publicKey) {
        messageId
        chainId
        certificateHash
      }
    }`))
  const res = await mutate({
    publicKey
  })
  return {
    chainId: graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'chainId') as string,
    messageId: graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'messageId') as string,
    certificateHash: graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'certificateHash') as string
  } as rpc.OpenChainResp
}

const initMicrochainChainStore = async (publicKey: string, signature: string, chainId: string, messageId: string, certificateHash: string) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation walletInitWithoutKeypair ($publicKey: String!, $signature: String!, $faucetUrl: String!, $chainId: String!, $messageId: String!, $certificateHash: String!) {
      walletInitWithoutKeypair(publicKey: $publicKey, signature: $signature, faucetUrl: $faucetUrl, chainId: $chainId, messageId: $messageId, certificateHash: $certificateHash)
    }`))
  return await mutate({
    publicKey,
    signature,
    faucetUrl: endpoint.faucetLocalUrl,
    chainId,
    messageId,
    certificateHash
  })
}

defineExpose({
  openChain,
  initMicrochainChainStore
})

</script>
