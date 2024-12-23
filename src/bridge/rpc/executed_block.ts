import { graphqlResult } from 'src/utils'
import { db, rpc } from 'src/model'
import { EXECUTE_BLOCK_WITH_FULL_MATERIALS } from 'src/graphql'
import {
  type IncomingBundle,
  type ExecuteBlockWithFullMaterialsMutation,
  type ExecutedBlockMaterial
} from 'src/__generated__/graphql/service/graphql'
import * as dbBridge from '../db'
import axios from 'axios'
import { parse, stringify } from 'lossless-json'

export class ExecutedBlock {
  static executeBlockWithFullMaterials = async (
    chainId: string,
    operations: rpc.Operation[],
    incomingBundles: IncomingBundle[],
    localTime: number
  ): Promise<ExecutedBlockMaterial> => {
    const network = (await dbBridge.Network.selected()) as db.Network
    if (!network) return Promise.reject('Invalid network')

    const applicationUrl = process.env.DEV ? network?.path : `http://${network?.host}:${network?.port}`
    return new Promise((resolve, reject) => {
      axios
        .post(
          applicationUrl,
          stringify({
            query: EXECUTE_BLOCK_WITH_FULL_MATERIALS.loc?.source.body,
            variables: {
              chainId,
              operations,
              incomingBundles,
              localTime
            },
            operationName: 'executeBlockWithFullMaterials'
          }),
          {
            responseType: 'text',
            transformResponse: [(data) => data as string]
          }
        )
        .then((res) => {
          const dataString = graphqlResult.rootData(res) as string
          const data = parse(dataString)
          const errors = (data as Record<string, unknown[]>).errors
          if (errors && errors.length > 0) {
            return reject(stringify(errors))
          }
          const executeBlockWithFullMaterials = (
            data as Record<string, ExecuteBlockWithFullMaterialsMutation>
          ).data
          resolve(executeBlockWithFullMaterials.executeBlockWithFullMaterials)
        })
        .catch((e) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`Failed execute block with full materials: ${e}`)
          reject(e)
        })
    })
  }
}
