import { DocumentNode } from 'graphql'
import { db } from 'src/model'
import { graphqlResult } from 'src/utils'
import * as dbBridge from '../db'
import axios from 'axios'
import { Application } from './application'

export class ApplicationOperation {
  static existChainApplication = async (
    chainId: string,
    applicationId: string
  ): Promise<boolean> => {
    return (
      (await Application.microchainApplications(chainId)).findIndex(
        (el) => el.id === applicationId
      ) >= 0
    )
  }

  static waitExistChainApplication = async (
    chainId: string,
    applicationId: string,
    timeoutSeconds: number
  ): Promise<boolean> => {
    if (
      (await Application.microchainApplications(chainId)).findIndex(
        (el) => el.id === applicationId
      ) >= 0
    ) {
      return true
    }
    if (timeoutSeconds <= 0) {
      return Promise.reject('Wait timeout')
    }
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        ApplicationOperation.waitExistChainApplication(
          chainId,
          applicationId,
          timeoutSeconds - 1
        )
          .then((exists) => {
            resolve(exists)
          })
          .catch((e) => {
            reject(e)
          })
      }, 1000)
    })
  }

  static queryApplication = async (
    chainId: string,
    applicationId: string,
    query: DocumentNode,
    operationName: string,
    variables?: Record<string, unknown>
  ): Promise<Uint8Array | undefined> => {
    const network = (await dbBridge.Network.selected()) as db.Network
    if (!network) return

    // TODO: we can serialize locally

    variables = variables || {}
    variables.checko_query_only = true

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
          const bytes = graphqlResult.keyValue(
            data,
            operationName
          ) as Uint8Array
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
