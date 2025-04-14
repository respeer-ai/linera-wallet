import { graphqlResult } from 'src/utils'
import { BLOCK_MATERIAL } from 'src/graphql'
import {
  type BlockMaterialQuery,
  type CandidateBlockMaterial
} from 'src/__generated__/graphql/service/graphql'
import { parse, stringify } from 'lossless-json'
import axios from 'axios'
import * as dbBridge from '../db'
import { dbModel } from 'src/model'

export class BlockMaterial {
  static getBlockMaterial = async (
    chainId: string,
    maxPendingMessages: number
  ): Promise<CandidateBlockMaterial> => {
    const network = (await dbBridge.Network.selected()) as dbModel.Network
    if (!network) return Promise.reject('Invalid network')

    const rpcUrl = `${network?.rpcSchema}://${network?.host}:${network?.port}${
      network?.path.length ? network?.path : ''
    }`
    return new Promise((resolve, reject) => {
      axios
        .post(
          rpcUrl,
          {
            query: BLOCK_MATERIAL.loc?.source.body,
            variables: {
              chainId,
              maxPendingMessages
            },
            operationName: 'blockMaterial'
          },
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
          const blockMaterial = (data as Record<string, BlockMaterialQuery>)
            .data
          resolve(blockMaterial.blockMaterial)
        })
        .catch((e) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`Failed query block material: ${e}`)
          reject(e)
        })
    })
  }
}
