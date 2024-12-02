import { DocumentNode } from 'graphql'
import { rpc, db } from 'src/model'
import { graphqlResult } from 'src/utils'
import { SUBSCRIBE_CREATOR_CHAIN, LEGACY_REQUEST_SUBSCRIBE, SCHEMA, SUBSCRIBED_CREATOR_CHAIN } from 'src/graphql'
import { uid } from 'quasar'
import * as dbBridge from '../db'
import { Operation } from './operation'
import { stringify } from 'lossless-json'
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'

export class ApplicationOperation {
  static existChainApplication = async (
    chainId: string,
    applicationId: string
  ): Promise<boolean> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc, chainId, applicationId)
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          SCHEMA,
          {
          },
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult(() => {
        resolve(true)
      })

      onError((e) => {
        if (stringify(e)?.includes('is not registered by the chain during Query')) {
          return resolve(false)
        }
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Query chain application: ${e}`))
      })
    })
  }

  static subscribedCreatorChain = async (
    chainId: string,
    applicationId: string
  ): Promise<boolean> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc, chainId, applicationId)
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          SUBSCRIBED_CREATOR_CHAIN,
          {
          },
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        const subscribed = graphqlResult.keyValue(
          res,
          'subscribedCreatorChain'
        ) as boolean
        resolve(subscribed)
      })

      onError((e) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Query chain application: ${e}`))
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
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc, chainId, applicationId)
    const apolloClient = new ApolloClient(options)

    variables = variables || {}
    variables.checko_query_only = true

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          query,
          variables || {},
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        const bytes = graphqlResult.keyValue(
          res,
          operationName
        ) as Uint8Array
        resolve(bytes)
      })

      onError((e) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Failed query application: ${e}`)
        reject(e)
      })
    })
  }

  static subscribeCreatorChain = async (
    chainId: string,
    applicationId: string,
    applicationType: db.ApplicationType
  ) => {
    if (await ApplicationOperation.subscribedCreatorChain(chainId, applicationId)) return

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
