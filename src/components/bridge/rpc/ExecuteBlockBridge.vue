<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'
import { EXECUTE_BLOCK_WITH_FULL_MATERIALS } from 'src/graphql'

// TODO: use type in gql definition
const executeBlockWithFullMaterials = async (
  chainId: string,
  operations: rpc.Operation[],
  incomingBundles: rpc.IncomingBundle[],
  localTime: number
): Promise<rpc.ExecuteBlockResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const bundles = incomingBundles.map((el) => {
    return {
      origin: el.origin,
      bundle: el.bundle,
      action: el.action
    } as rpc.IncomingBundle
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(EXECUTE_BLOCK_WITH_FULL_MATERIALS))
  const res = await mutate({
    chainId,
    operations,
    incomingBundles: bundles,
    localTime
  })
  return graphqlResult.data(res, 'executeBlockWithFullMaterials') as rpc.ExecuteBlockResp
}

defineExpose({
  executeBlockWithFullMaterials
})

</script>
