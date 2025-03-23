import { graphqlResult } from 'src/utils'
import { db, rpc } from 'src/model'
import { SIMULATE_EXECUTE_BLOCK } from 'src/graphql'
import {
  type SimulateExecuteBlockMutation,
  type ExecutedBlockMaterial,
  type CandidateBlockMaterial
} from 'src/__generated__/graphql/service/graphql'
import * as dbBridge from '../db'
import axios from 'axios'
import { parse, stringify } from 'lossless-json'

export class ExecutedBlock {
  static simulateExecuteBlock = async (
    chainId: string,
    operations: rpc.Operation[],
    candidate: CandidateBlockMaterial
  ): Promise<ExecutedBlockMaterial> => {
    const network = (await dbBridge.Network.selected()) as db.Network
    if (!network) return Promise.reject('Invalid network')

    const applicationUrl = process.env.DEV
      ? network?.path
      : `${network?.rpcSchema}://${network?.host}:${network?.port}${
          network.path?.length ? network.path : ''
        }`
    const blockMaterial = {
      operations,
      candidate
    }

    return new Promise((resolve, reject) => {
      axios
        .post(
          applicationUrl,
          stringify({
            query: SIMULATE_EXECUTE_BLOCK.loc?.source.body,
            variables: {
              chainId,
              blockMaterial
            },
            operationName: 'simulateExecuteBlock'
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
          const simulateExecuteBlock = (
            data as Record<string, SimulateExecuteBlockMutation>
          ).data
          resolve(
            simulateExecuteBlock.simulateExecuteBlock as ExecutedBlockMaterial
          )
        })
        .catch((e) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`Failed execute block with full materials: ${e}`)
          reject(e)
        })
    })
  }
}
