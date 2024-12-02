import { sharedStore } from '../../../src-bex/store'
import axios from 'axios'
import {
  RpcRequest,
  RpcGraphqlQuery,
  lineraGraphqlOperation,
  GraphqlOperation,
  lineraGraphqlMutationQueryWithQuery
} from '../types'
import { SubscriptionClient } from 'graphql-subscriptions-client'
import { basebridge } from '../../../src-bex/event'
import { subscription } from '../../subscription'
import type { Json } from '@metamask/utils'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { db, rpc } from '../../../src/model'
import { v4 as uuidv4 } from 'uuid'
import { graphqlResult } from '../../../src/utils'
import { parse, stringify } from 'lossless-json'
import { rpcBridge } from '../../../src/bridge'

const queryUrl = async (microchain: string, query: RpcGraphqlQuery) => {
  let graphqlUrl: string
  try {
    graphqlUrl = await sharedStore.getRpcEndpoint()
  } catch (e) {
    return await Promise.reject(e)
  }
  if (!graphqlUrl) {
    return await Promise.reject('Invalid graphql endpoint')
  }
  if (query.applicationId) {
    graphqlUrl +=
      '/chains/' + microchain + '/applications/' + query.applicationId
  }
  return graphqlUrl
}

export const queryDo = async (
  microchain: string,
  query: RpcGraphqlQuery
): Promise<unknown> => {
  const graphqlUrl = await queryUrl(microchain, query)

  return new Promise((resolve, reject) => {
    axios
      .post(graphqlUrl, stringify(query.query), {
        responseType: 'text',
        transformResponse: [(data) => data as string]
      })
      .then((res) => {
        const dataString = graphqlResult.rootData(res) as string
        const data = parse(dataString)
        const errors = (data as Record<string, unknown[]>).errors
        if (errors && errors.length > 0) {
          return reject(stringify(errors))
        }
        const _data = (data as Record<string, unknown>).data
        resolve(_data)
      })
      .catch((e) => {
        reject(e)
      })
  })
}

const graphqlResponseKeyValue = (data: unknown, key: string) => {
  return (data as Record<string, unknown>)[key]
}

export const queryApplication = async (
  microchain: string,
  query: RpcGraphqlQuery
): Promise<unknown> => {
  const operationName = lineraGraphqlMutationQueryWithQuery(query.query.query)
  if (!operationName) return Promise.reject('Invalid operation')

  const graphqlUrl = await queryUrl(microchain, query)

  // TODO: we can serialize locally

  const variables = query.query.variables || {}
  if (query.applicationId) {
    variables.checko_query_only = true
  }
  return new Promise((resolve, reject) => {
    axios
      .post(
        graphqlUrl,
        stringify({
          query: query.query.query,
          variables,
          operationName: query.query.operationName
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
        const _data = (data as Record<string, unknown>).data
        const payload = graphqlResponseKeyValue(
          _data,
          operationName[0].toLowerCase() + operationName.slice(1)
        )
        resolve(payload)
      })
      .catch((e) => {
        reject(e)
      })
  })
}

const queryApplicationMutation = async (
  microchain: string,
  query: RpcGraphqlQuery
) => {
  const queryBytes = await queryApplication(microchain, query)

  const operation = {
    User: {
      application_id: query.applicationId,
      bytes: queryBytes
    }
  } as rpc.Operation
  const operationId = uuidv4()

  // TODO: parse application operation

  await sharedStore.createChainOperation({
    operationId,
    microchain,
    operationType: db.OperationType.ANONYMOUS,
    applicationId: query.applicationId,
    applicationType: db.ApplicationType.ANONYMOUS,
    operation: stringify(operation),
    graphqlQuery: query.query.query,
    graphqlVariables: stringify(query.query.variables),
    state: db.OperationState.CREATED
  } as db.ChainOperation)

  return { operationId }
}

const parseSystemMutation = async (
  microchain: string,
  query: RpcGraphqlQuery
) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion
  const operation = (await lineraWasm.graphql_deserialize_operation(
    query.query.query,
    stringify(query.query.variables) as string
  )) as string

  const operationId = uuidv4()

  await sharedStore.createChainOperation({
    operationId,
    microchain,
    operationType: db.OperationType.ANONYMOUS,
    applicationId: query.applicationId,
    applicationType: db.ApplicationType.ANONYMOUS,
    operation,
    graphqlQuery: query.query.query,
    graphqlVariables: stringify(query.query.variables),
    state: db.OperationState.CREATED
  } as db.ChainOperation)

  return { operationId, operation }
}

const mutationDo = async (microchain: string, query: RpcGraphqlQuery) => {
  // If it's system operation, parse it
  // If it's application operation, construct bytes
  // TODO: for application operation, we need to get its wasm code blob, then load into wrap, get it service type definition, then feed to async graphql. This will be done in rust
  // Then, add operation to database, wait for block signer process it

  if (query.applicationId)
    return await queryApplicationMutation(microchain, query)
  return await parseSystemMutation(microchain, query)
}

const lineraGraphqlDoHandler = async (request?: RpcRequest) => {
  if (!request) {
    return await Promise.reject('Invalid request')
  }
  const query = request.request.params as unknown as RpcGraphqlQuery
  if (!query || !query.query) {
    return await Promise.reject('Invalid query')
  }
  const publicKey = query.publicKey
  const microchain = await sharedStore.getRpcMicrochain(
    request.origin,
    publicKey as string
  )
  if (!microchain) {
    return Promise.reject(new Error('Invalid microchain'))
  }
  if (!query.query.variables) {
    query.query.variables = {}
  }

  // If it's query, just query from endpoint

  const graphqlOperation = lineraGraphqlOperation(request)
  switch (graphqlOperation) {
    case GraphqlOperation.MUTATION:
      return mutationDo(microchain, query)
    case GraphqlOperation.QUERY:
      return queryDo(microchain, query)
  }
}

export const lineraGraphqlPublishDataBlob = async (request?: RpcRequest) => {
  if (!request) {
    return await Promise.reject('Invalid request')
  }
  const query = request.request.params as unknown as RpcGraphqlQuery
  if (!query || !query.query) {
    return await Promise.reject('Invalid query')
  }
  const publicKey = query.publicKey
  const microchain = await sharedStore.getRpcMicrochain(
    request.origin,
    publicKey as string
  )
  if (!microchain) {
    return Promise.reject(new Error('Invalid microchain'))
  }

  const blobHash = await rpcBridge.PendingBlob.addPendingBlob(
    microchain,
    (query.query.variables as Record<string, Uint8Array>).bytes
  )

  const operationId = uuidv4()
  const operation = JSON.stringify({
    System: {
      PublishDataBlob: {
        blob_hash: blobHash
      }
    }
  } as rpc.Operation)

  await sharedStore.createChainOperation({
    operationId,
    microchain,
    operationType: db.OperationType.ANONYMOUS,
    applicationId: query.applicationId,
    applicationType: db.ApplicationType.ANONYMOUS,
    operation,
    graphqlQuery: query.query.query,
    graphqlVariables: stringify(query.query.variables),
    state: db.OperationState.CREATED
  } as db.ChainOperation)

  return { operationId, operation, blobHash }
}

export const lineraGraphqlMutationHandler = async (request?: RpcRequest) => {
  return lineraGraphqlDoHandler(request)
}

export const lineraGraphqlQueryHandler = async (request?: RpcRequest) => {
  return lineraGraphqlDoHandler(request)
}

export const lineraGraphqlSubscribeHandler = async (request?: RpcRequest) => {
  if (!request) {
    return await Promise.reject('Invalid request')
  }
  const subscriptionId = subscription.Subscription.subscribe(
    request.request.params as string[],
    async (subscriptionId: string, data: unknown) => {
      const microchain = await sharedStore.getRpcMicrochain(request.origin, '')
      if (!microchain) {
        return Promise.reject(new Error('Invalid microchain'))
      }
      const _data = data as Record<
        string,
        Record<string, Record<string, string>>
      >
      if (microchain !== _data.data.notifications.chain_id) {
        return
      }
      void basebridge.EventBus.bridge?.send('linera_subscription', {
        subscriptionId,
        payload: _data.data
      } as subscription.SubscriptionPayload)
    }
  )
  return await Promise.resolve(subscriptionId)
}

export const lineraGraphqlUnsubscribeHandler = async (request?: RpcRequest) => {
  if (!request) {
    return await Promise.reject('Invalid request')
  }
  const subscriptionId = (
    request.request.params?.length
      ? (request.request.params as Json[])[0]
      : undefined
  ) as string
  if (!subscriptionId) {
    return await Promise.reject(new Error('Invalid subscription id'))
  }
  subscription.Subscription.unsubscribe(subscriptionId)
  return await Promise.resolve(subscriptionId)
}

export const setupLineraSubscription = () => {
  let subscriptionEndpoint: string
  let client: SubscriptionClient

  type unsubscribeFunc = () => void
  const subscribed = new Map<string, unsubscribeFunc>()

  setInterval(() => {
    sharedStore
      .getSubscriptionEndpoint()
      .then((endpoint) => {
        if (!endpoint?.length) return
        if (subscriptionEndpoint !== endpoint) {
          subscriptionEndpoint = endpoint
          client = new SubscriptionClient(subscriptionEndpoint, {
            reconnect: true,
            lazy: true,
            connectionCallback: (e) => {
              if (e) {
                console.log('Connection error', e)
              }
            }
          })
          subscribed.forEach((unsubscribe) => {
            unsubscribe()
          })
          subscribed.clear()
        }
        sharedStore
          .getMicrochains()
          .then((microchains) => {
            microchains.forEach((microchain) => {
              if (subscribed.has(microchain)) return
              const _subscribed = client
                .request({
                  query: `subscription notifications($chainId: String!) {
                  notifications(chainId: $chainId)
                }`,
                  variables: {
                    chainId: microchain
                  }
                })
                .subscribe({
                  next(data: unknown) {
                    try {
                      subscription.Subscription.handle(data)
                    } catch (e) {
                      console.log('Failed process data', e, data)
                    }
                  }
                })
              subscribed.set(microchain, _subscribed.unsubscribe)
            })
          })
          .catch((e) => {
            console.log('Failed get microchains', e)
          })
      })
      .catch((e) => {
        console.log('Failed get subscription endpoint', e)
      })
  }, 1000)
}
