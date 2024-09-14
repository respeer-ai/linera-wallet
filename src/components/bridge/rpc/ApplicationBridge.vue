<script setup lang='ts'>
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { graphqlResult, endpoint } from 'src/utils'
import { rpc } from 'src/model'

const microchainApplications = async (microchain: string): Promise<rpc.ApplicationsResp[]> => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query applications($chainId: String!) {
      applications(chainId: $chainId) {
        id
        link
        description
      }
    }
  `, {
    chainId: microchain
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      const applications = graphqlResult.data(res, 'applications') as rpc.ApplicationsResp[]
      resolve(applications)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Get applications: ${error}`))
    })
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const applications = async (microchains: string[]) => {
  const _applications = [] as rpc.ApplicationsResp[]
  for (const microchain of microchains) {
    _applications.push(...await microchainApplications(microchain))
  }
  return _applications
}

defineExpose({
  applications
})

</script>
