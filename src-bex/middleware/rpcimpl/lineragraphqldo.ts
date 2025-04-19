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
import { dbModel, rpcModel } from '../../../src/model'
import { v4 as uuidv4 } from 'uuid'
import { graphqlResult } from '../../../src/utils'
import { parse, stringify } from 'lossless-json'
import { dbBridge } from '../../../src/bridge'

const queryUrl = async (microchain: string, query: RpcGraphqlQuery) => {
  let graphqlUrl: string
  try {
    graphqlUrl = await dbBridge.Network.rpcEndpoint()
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

const graphqlResponseKeyValue = (data: unknown, key: string) => {
  return (data as Record<string, unknown>)[key]
}

export const queryDo = async (
  microchain: string,
  query: RpcGraphqlQuery
): Promise<unknown> => {
  const graphqlUrl = await queryUrl(microchain, query)

  const operationName = lineraGraphqlMutationQueryWithQuery(query.query.query)
  if (!operationName) return Promise.reject('Invalid operation')

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

export const applicationQueryBytes = (
  query: RpcGraphqlQuery
): number[] | undefined => {
  // Application operation bytes must be serialized from caller side
  if (query.query.applicationOperationBytes) {
    return JSON.parse(
      query.query.applicationOperationBytes as unknown as string
    ) as number[]
  } else {
    return undefined
  }
}

const queryApplicationMutation = async (
  microchain: string,
  query: RpcGraphqlQuery
) => {
  const queryBytes = applicationQueryBytes(query)
  if (!queryBytes) return Promise.reject('Invalid application operation')

  const operation = {
    User: {
      applicationId: query.applicationId,
      bytes: queryBytes
    }
  } as rpcModel.Operation
  const operationId = uuidv4()

  // Normally we don't publish blob with application operation

  await dbBridge.ChainOperation.create({
    operationId,
    microchain,
    operationType: dbModel.OperationType.ANONYMOUS,
    applicationId: query.applicationId,
    applicationType: dbModel.ApplicationType.ANONYMOUS,
    operation: stringify(operation),
    graphqlQuery: query.query.query,
    graphqlVariables: stringify(query.query.variables),
    state: dbModel.OperationState.CREATED
  } as dbModel.ChainOperation)

  subscription.Subscription.handle({
    topic: 'NewOperation',
    microchain,
    operationId
  })

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

  // Create blob for operation
  await dbBridge.ChainOperation.createOperationBlobs(
    operationId,
    query.query.blobBytes || []
  )

  await dbBridge.ChainOperation.create({
    operationId,
    microchain,
    operationType: dbModel.OperationType.ANONYMOUS,
    applicationId: query.applicationId,
    applicationType: dbModel.ApplicationType.ANONYMOUS,
    operation,
    graphqlQuery: query.query.query,
    graphqlVariables: stringify(query.query.variables),
    state: dbModel.OperationState.CREATED
  } as dbModel.ChainOperation)

  subscription.Subscription.handle({
    topic: 'NewOperation',
    microchain,
    operationId
  })

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
  const microchain = await dbBridge.RpcAuth.rpcMicrochain(
    request.origin,
    publicKey as string
  )
  if (!microchain) {
    return Promise.reject(new Error('Invalid microchain'))
  }

  if (!query.query.variables) {
    // TODO: process all transferrable array in variables
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

export const lineraGraphqlMutationHandler = async (request?: RpcRequest) => {
  return lineraGraphqlDoHandler(request)
}

export const lineraGraphqlQueryHandler = async (request?: RpcRequest) => {
  return lineraGraphqlDoHandler(request)
}

export const lineraGraphqlSubscribeHandler = async (request?: RpcRequest) => {
  if (!request) {
    return Promise.reject('Invalid request')
  }
  const query = request.request.params as unknown as RpcGraphqlQuery
  if (!query) {
    return Promise.reject('Invalid query')
  }
  const publicKey = query.publicKey
  if (!publicKey) {
    return Promise.reject('Invalid public key')
  }
  const subscriptionId = subscription.Subscription.subscribe(
    query.topics as string[],
    async (subscriptionId: string, data: unknown) => {
      const microchain = await dbBridge.RpcAuth.rpcMicrochain(
        request.origin,
        publicKey
      )
      if (!microchain) {
        console.log(
          `RPC microchain for public key ${publicKey} of origin ${request.origin} is not available`
        )
        return Promise.reject(new Error('Invalid microchain'))
      }
      const _data = data as Record<
        string,
        Record<string, Record<string, string>>
      >
      if (microchain !== _data?.data?.notifications?.chain_id) {
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
    dbBridge.Network.subscriptionEndpoint()
      .then(async (endpoint) => {
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

        const microchains = (await dbBridge.Microchain.microchains(0, 0)).map(
          (el) => el.microchain
        )
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
          subscription.Subscription.handle({
            topic: 'Initialized',
            microchain
          })
          subscribed.set(microchain, _subscribed.unsubscribe)
        })
      })
      .catch((e) => {
        console.log('Failed get subscription endpoint', e)
      })
  }, 1000)
}
