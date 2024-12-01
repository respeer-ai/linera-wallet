import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { NETWORK_INFO } from 'src/graphql'
import { type NetworkInfoQuery } from 'src/__generated__/graphql/faucet/graphql'

export class GenesisInfo {
  static getNetworkInfo = async (): Promise<NetworkInfoQuery> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Faucet)
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          NETWORK_INFO,
          {},
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        resolve(graphqlResult.rootData(res) as NetworkInfoQuery)
      })

      onError((error) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Get block: ${error}`))
      })
    })
  }
}
