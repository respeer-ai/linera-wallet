import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'
import { EXECUTE_BLOCK_WITH_FULL_MATERIALS } from 'src/graphql'
import { type IncomingBundle, type ExecuteBlockWithFullMaterialsMutation, type ExecutedBlockMaterial } from 'src/__generated__/graphql/service/graphql'

export class ExecutedBlock {
  static executeBlockWithFullMaterials = async (
    chainId: string,
    operations: rpc.Operation[],
    incomingBundles: IncomingBundle[],
    localTime: number
  ): Promise<ExecutedBlockMaterial> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { mutate } = provideApolloClient(apolloClient)(() => useMutation(EXECUTE_BLOCK_WITH_FULL_MATERIALS))
    const res = await mutate({
      chainId,
      operations,
      incomingBundles,
      localTime
    })
    return (graphqlResult.rootData(res) as ExecuteBlockWithFullMaterialsMutation).executeBlockWithFullMaterials
  }
}
