<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'

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

  const { mutate } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation executeBlockWithFullMaterials (
      $chainId: String!,
      $operations: [Operation!]!,
      $incomingBundles: [UserIncomingBundle!]!,
      $localTime: Int!
    ) {
      executeBlockWithFullMaterials(
        chainId: $chainId,
        operations: $operations,
        incomingBundles: $incomingBundles,
        localTime: $localTime
      ) {
        block {
          chainId
          epoch
          height
          timestamp
          authenticatedSigner
          previousBlockHash
          incomingBundles {
            origin
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
            action
          }
          operations
        }
        outcome {
          messages {
            destination
            authenticatedSigner
            grant
            refundGrantTo
            kind
            message
          }
          stateHash
          oracleResponses
          events {
            streamId {
              applicationId
              streamName
            }
            key
            value
          }
        }
      }
    }`))
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
