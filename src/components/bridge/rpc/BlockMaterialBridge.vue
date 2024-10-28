<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'
import { BLOCK_MATERIAL } from 'src/graphql'

const getBlockMaterial = async (chainId: string): Promise<rpc.BlockMaterialResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(BLOCK_MATERIAL, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      const blockMaterial = graphqlResult.data(res, 'blockMaterial') as rpc.BlockMaterialResp
      resolve(blockMaterial)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Get block: ${error}`))
    })
  })
}

defineExpose({
  getBlockMaterial
})

</script>
