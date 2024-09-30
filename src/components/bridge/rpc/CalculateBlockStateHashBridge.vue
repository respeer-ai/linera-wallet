<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'

// TODO: use type in gql definition
const calculateBlockStateHashWithFullMaterials = async (
  chainId: string,
  operations: rpc.Operation[],
  incomingBundles: rpc.IncomingBundle[],
  localTime: number
): Promise<rpc.CalculateBlockStateHashResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const bundles = incomingBundles.map((el) => {
    return {
      origin: el.origin,
      bundle: el.bundle,
      action: el.action
    } as rpc.IncomingBundle
  })

  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation calculateBlockStateHashWithFullMaterials ($chainId: String!, $operations: [Operation!]!, $incomingBundles: [UserIncomingBundle!]!, $localTime: Int!) {
      calculateBlockStateHashWithFullMaterials(chainId: $chainId, operations: $operations, incomingBundles: $incomingBundles, localTime: $localTime)
    }`))
  const res = await mutate({
    chainId,
    operations,
    incomingBundles: bundles,
    localTime
  })
  return graphqlResult.data(res, 'calculateBlockStateHashWithFullMaterials') as rpc.CalculateBlockStateHashResp
}

defineExpose({
  calculateBlockStateHashWithFullMaterials
})

</script>
