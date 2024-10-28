<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'
import { PENDING_MESSAGES } from 'src/graphql'

const getPendingMessages = async (chainId: string): Promise<rpc.PendingMessagesResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(PENDING_MESSAGES, {
    chainId
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      const messages = graphqlResult.data(res, 'pendingMessages') as rpc.PendingMessagesResp
      resolve(messages)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Get block: ${error}`))
    })
  })
}

defineExpose({
  getPendingMessages
})

</script>
