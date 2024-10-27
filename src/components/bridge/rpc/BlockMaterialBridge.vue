<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'

const getBlockMaterial = async (chainId: string): Promise<rpc.BlockMaterialResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query blockMaterial($chainId: ChainId!) {
      blockMaterial(chainId: $chainId) {
        incomingBundles {
          action
          bundle {
            height
            timestamp
            certificateHash
            transactionIndex
            messages {
              authenticatedSigner
              grant
              refundGrantTo
              kind
              index
              message
            }
          }
          origin
        }
        localTime
        round
      }
    }
  `, {
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
