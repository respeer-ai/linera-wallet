import { DocumentNode } from 'graphql'
import { db } from 'src/model'
import { graphqlResult } from 'src/utils'
import * as dbBridge from '../db'
import axios from 'axios'

export class ApplicationOperation {
  static queryApplication = async (
    chainId: string,
    applicationId: string,
    query: DocumentNode,
    operationName: string,
    variables?: Record<string, unknown>
  ): Promise<number[] | undefined> => {
    const network = (await dbBridge.Network.selected()) as db.Network
    if (!network) return

    // TODO: we can serialize locally

    const applicationUrl = process.env.DEV
      ? `${
          network.path?.length ? network.path : ''
        }/chains/${chainId}/applications/${applicationId}`
      : `${network?.rpcSchema}://${network?.host}:${network?.port}${
          network.path?.length ? network.path : ''
        }/chains/${chainId}/applications/${applicationId}`
    return new Promise((resolve, reject) => {
      axios
        .post(applicationUrl, {
          query: query.loc?.source.body,
          variables,
          operationName
        })
        .then((res) => {
          const data = graphqlResult.data(res, 'data')
          const bytes = graphqlResult.keyValue(data, operationName) as number[]
          resolve(bytes)
        })
        .catch((e) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`Failed query application: ${e}`)
          reject(e)
        })
    })
  }
}
