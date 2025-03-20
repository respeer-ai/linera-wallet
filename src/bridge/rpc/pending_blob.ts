import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { PREPARE_BLOB } from 'src/graphql'
import { graphqlResult } from 'src/utils'
import { type PrepareBlobMutation } from 'src/__generated__/graphql/service/graphql'

export class PendingBlob {
  static addPendingBlob = async (
    chainId: string,
    bytes: Uint8Array
  ): Promise<string> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { mutate } = provideApolloClient(apolloClient)(() =>
      useMutation(PREPARE_BLOB)
    )
    const res = await mutate({
      chainId,
      bytes
    })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return (graphqlResult.rootData(res) as PrepareBlobMutation)
      .prepareBlob as string
  }
}
