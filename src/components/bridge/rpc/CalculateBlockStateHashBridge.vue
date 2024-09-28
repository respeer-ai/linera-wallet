<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'
import Operation from '../../../../wasm/linera-protocol/linera-service-graphql-client/gql/service_schema.graphql'

// TODO: use type in gql definition
const calculateBlockStateHashWithFullMaterials = async (chainId: string): Promise<rpc.CalculateBlockStateHashResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Faucet)
  const apolloClient = new ApolloClient(options)

  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation calculateBlockStateHashWithFullMaterials ($chainId: String!, $operations: [Operation!]!) {
      calculateBlockStateHashWithFullMaterials(chainId: $chainId, operations: $operations) {
        messageId
        chainId
        certificateHash
      }
    }`))
  const res = await mutate({
    chainId
  })
  return graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'calculateBlockStateHashWithFullMaterials') as rpc.CalculateBlockStateHashResp
}

defineExpose({
  calculateBlockStateHashWithFullMaterials
})

</script>
