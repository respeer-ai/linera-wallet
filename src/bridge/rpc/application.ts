import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { APPLICATIONS } from 'src/graphql'
import {
  type ApplicationsQuery,
  type ApplicationOverview
} from 'src/__generated__/graphql/service/graphql'

export class Application {
  static microchainApplications = async (
    microchain: string
  ): Promise<ApplicationOverview[]> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          APPLICATIONS,
          {
            chainId: microchain
          },
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        resolve(
          (graphqlResult.rootData(res) as ApplicationsQuery)
            .applications as ApplicationOverview[]
        )
      })

      onError((error) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Get applications: ${error}`))
      })
    })
  }

  static applications = async (microchains: string[]) => {
    const _applications = [] as ApplicationOverview[]
    for (const microchain of microchains) {
      _applications.push(
        ...(await Application.microchainApplications(microchain))
      )
    }
    return _applications
  }
}
