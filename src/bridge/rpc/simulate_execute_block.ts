import { graphqlResult } from 'src/utils'
import { dbModel, rpcModel } from 'src/model'
import { SIMULATE_EXECUTE_BLOCK } from 'src/graphql'
import {
  type SimulateExecuteBlockMutation,
  type SimulatedBlockMaterial,
  type CandidateBlockMaterial
} from 'src/__generated__/graphql/service/graphql'
import * as dbBridge from '../db'
import axios from 'axios'
import { parse, stringify } from 'lossless-json'

export class SimulatedBlock {
  static simulateExecuteBlock = async (
    chainId: string,
    operations: rpcModel.Operation[],
    blobBytes: Array<Uint8Array>,
    candidate: CandidateBlockMaterial
  ): Promise<SimulatedBlockMaterial> => {
    const network = (await dbBridge.Network.selected()) as dbModel.Network
    if (!network) return Promise.reject('Invalid network')

    const blockMaterial = {
      operations,
      blobBytes: Array.from(blobBytes.map((bytes) => Array.from(bytes))),
      candidate
    }

    return new Promise((resolve, reject) => {
      axios
        .post(
          network.rpcUrl,
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
            simulateExecuteBlock.simulateExecuteBlock as SimulatedBlockMaterial
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
