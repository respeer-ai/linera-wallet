import { DocumentNode } from 'graphql'
import { rpc, db } from 'src/model'
import axios from 'axios'
import { graphqlResult } from 'src/utils'
import { SUBSCRIBE_CREATOR_CHAIN, LEGACY_REQUEST_SUBSCRIBE } from 'src/graphql'
import { uid } from 'quasar'
import * as dbBridge from '../db'
import { Operation } from './operation'

export class ApplicationOperation {
  static existChainApplication = async (
    chainId: string,
    applicationId: string
  ): Promise<boolean> => {
    const network = (await dbBridge.Network.selected()) as db.Network
    if (!network) return false

    // TODO: application creation chain may not loaded in our rpc endpoint

    const applicationUrl = `http://${network?.host}:${network?.port}/chains/${chainId}/applications/${applicationId}`
    return new Promise((resolve, reject) => {
      axios
        .get(applicationUrl)
        .then(() => {
          resolve(true)
        })
        .catch((e) => {
          reject(e)
        })
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

    const applicationUrl = `http://${network?.host}:${network?.port}/chains/${chainId}/applications/${applicationId}`
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

  static subscribeCreatorChain = async (
    chainId: string,
    applicationId: string,
    applicationType: db.ApplicationType,
    force?: boolean
  ) => {
    if (
      !force &&
      (await dbBridge.ApplicationCreatorChainSubscription.subscribed(
        chainId,
        applicationId
      ))
    )
      return

    if (
      await dbBridge.ChainOperation.exists(
        chainId,
        db.OperationType.SUBSCRIBE_CREATOR_CHAIN,
        applicationId,
        [
          db.OperationState.CREATED,
          db.OperationState.EXECUTING,
          db.OperationState.EXECUTED,
          db.OperationState.CONFIRMED
        ]
      )
    )
      return

    try {
      const queryRespBytes = await ApplicationOperation.queryApplication(
        chainId,
        applicationId,
        SUBSCRIBE_CREATOR_CHAIN,
        'subscribeCreatorChain'
      )
      const operationId = uid()

      const operation = {
        operationType: db.OperationType.SUBSCRIBE_CREATOR_CHAIN,
        operationId,
        microchain: chainId,
        applicationId,
        applicationType,
        operation: JSON.stringify({
          User: {
            application_id: applicationId,
            bytes: queryRespBytes
          }
        } as rpc.Operation),
        graphqlQuery: SUBSCRIBE_CREATOR_CHAIN.loc?.source?.body
      } as db.ChainOperation
      await dbBridge.ChainOperation.create({ ...operation })

      await Operation.waitOperation(operationId)

      await dbBridge.ApplicationCreatorChainSubscription.create(
        operation.microchain,
        applicationId
      )
    } catch (e) {
      return Promise.reject(e)
    }
  }

  static requestSubscribe = async (chainId: string, applicationId: string) => {
    const queryRespBytes = await ApplicationOperation.queryApplication(
      chainId,
      applicationId,
      LEGACY_REQUEST_SUBSCRIBE,
      'requestSubscribe'
    )

    const operation = {
      operationType: db.OperationType.LEGACY_REQUEST_SUBSCRIBE,
      operationId: uid(),
      microchain: chainId,
      applicationId,
      applicationType: db.ApplicationType.ANONYMOUS,
      operation: JSON.stringify({
        User: {
          application_id: applicationId,
          bytes: queryRespBytes || []
        }
      } as rpc.Operation),
      graphqlQuery: LEGACY_REQUEST_SUBSCRIBE.loc?.source?.body
    } as db.ChainOperation
    await dbBridge.ChainOperation.create({ ...operation })
  }
}
