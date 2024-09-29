<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Scalars, IncomingBundle } from '../../../../dist/__generated__/graphql/graphql'

// TODO: use type in gql definition
const calculateBlockStateHashWithFullMaterials = async (
  chainId: string,
  operations: rpc.Operation[],
  incomingBundles: rpc.IncomingBundle[],
  localTime: number
): Promise<rpc.CalculateBlockStateHashResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Faucet)
  const apolloClient = new ApolloClient(options)

  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation calculateBlockStateHashWithFullMaterials ($chainId: String!, $operations: [Scalars.Operation!]!, $incomingBundles: [IncomingBundle!]!, $localTime: Int!) {
      calculateBlockStateHashWithFullMaterials(chainId: $chainId, operations: $operations, incomingBundles: $incomingBundles, localTime: $localTime)
    }`))
  const res = await mutate({
    chainId,
    operations,
    incomingBundles,
    localTime
  })
  return graphqlResult.keyValue(graphqlResult.data(res, 'claim'), 'calculateBlockStateHashWithFullMaterials') as rpc.CalculateBlockStateHashResp
}

defineExpose({
  calculateBlockStateHashWithFullMaterials
})

</script>
