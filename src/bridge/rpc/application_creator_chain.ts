import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { EndpointType, getClientOptionsWithEndpointType } from '../../apollo'
import { CREATOR_CHAIN_ID } from '../../graphql'
import { graphqlResult } from '../../utils'

export class ApplicationCreatorChain {
  static id = async (
    chainId: string,
    applicationId: string
  ): Promise<string | undefined> => {
    const options = await getClientOptionsWithEndpointType(
      EndpointType.Rpc,
      chainId,
      applicationId
    )
    if (!options) return undefined
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          CREATOR_CHAIN_ID,
          {},
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        resolve(
          (graphqlResult.rootData(res) as Record<string, string>).creatorChainId
        )
      })

      onError((error) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Get applications: ${error}`))
      })
    })
  }
}
