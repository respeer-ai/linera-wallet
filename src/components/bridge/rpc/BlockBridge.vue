<script setup lang='ts'>
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation, useQuery } from '@vue/apollo-composable'
import { graphqlResult, endpoint, _hex } from 'src/utils'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'

const getPendingRawBlock = async (chainId: string) => {
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

  return new Promise((resolve, reject) => {
    onResult((res) => {
      const rawBlock = graphqlResult.data(res, 'peekCandidateRawBlockPayload')
      resolve(rawBlock)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Get pending block: ${error}`))
    })
  })
}

const submitBlockSignature = async (chainId: string, height: number, signature: string) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation submitBlockSignature ($chainId: String!, $height: Int!, $signature: String!) {
      submitBlockSignature(chainId: $chainId, height: $height, signature: $signature)
    }`))
  return await mutate({
    chainId,
    height,
    signature
  })
}

const signNewBlock = async (chainId: string, notifiedHeight: number, keyPair: Ed25519SigningKey) => {
  const rawBlockAndRound = await getPendingRawBlock(chainId)
  if (!rawBlockAndRound) return
  const payloadBytes = graphqlResult.keyValue(rawBlockAndRound, 'payloadBytes')
  const signature = _hex.toHex(keyPair.sign(new Memory(payloadBytes as Uint8Array)).to_bytes().bytes)
  const height = graphqlResult.keyValue(rawBlockAndRound, 'height') as number
  await submitBlockSignature(chainId, height, signature)
}

defineExpose({
  signNewBlock
})

</script>
