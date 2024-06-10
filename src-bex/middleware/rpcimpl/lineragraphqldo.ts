import { sharedStore } from '../../../src-bex/store'
import axios from 'axios'
import { RpcRequest } from '../types'
import { SubscriptionClient } from 'graphql-subscriptions-client'
import { basebridge } from 'app/src-bex/event'

interface GraphqlQuery {
  operationName: string
  query: string
  variables: Record<string, unknown>
}

interface RpcGraphqlQuery {
  applicationId?: string
  query: GraphqlQuery
}

export const lineraGraphqlMutationHandler = async (request?: RpcRequest) => {
  if (!request) {
    return Promise.reject('Invalid request')
  }
  const auth = await sharedStore.getRpcAuth(request.origin)
  if (!auth) {
    return Promise.reject('Mutation not authenticated')
  }
  const query = request.request.params as unknown as RpcGraphqlQuery
  if (!query || !query.query) {
    return Promise.reject('Invalid query')
  }
  if (!query.query.variables) {
    query.query.variables = {}
  }
  query.query.variables.chainId = auth.chainId
  let graphqlUrl: string
  try {
    graphqlUrl = await sharedStore.getRpcEndpoint()
  } catch (e) {
    return Promise.reject(e)
  }
  if (!graphqlUrl) {
    return Promise.reject('Invalid graphql endpoint')
  }
  if (query.applicationId) {
    graphqlUrl += '/checko/chains/' + auth.chainId + '/applications/' + query.applicationId
  }
  console.log('Linera mutation', graphqlUrl, query)
  return new Promise((resolve, reject) => {
    axios({
      method: 'post',
      url: graphqlUrl,
      data: (request.request.params as unknown as RpcGraphqlQuery)?.query
    }).then((res) => {
      if (!res.data) {
        return reject('Invalid response')
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if ((res.data.errors as unknown[])?.length) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return reject(new Error(JSON.stringify(res.data.errors)))
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      resolve(res.data.data)
    }).catch((e) => {
      reject(e)
    })
  })
}

export const lineraGraphqlQueryHandler = async (request?: RpcRequest) => {
  if (!request) {
    return Promise.reject('Invalid request')
  }
  console.log(request.request.params)
  return Promise.resolve('pong')
}

export const lineraGraphqlSubscriptionHandler = async (request?: RpcRequest) => {
  if (!request) {
    return Promise.reject('Invalid request')
  }
  console.log(request.request.params)
  return Promise.resolve('pong')
}

export const setupLineraSubscription = async () => {
  const subscriptionEndpoint = await sharedStore.getSubscriptionEndpoint()
  const client = new SubscriptionClient(subscriptionEndpoint, {
    reconnect: true,
    lazy: true,
    connectionCallback: (e) => {
      console.log('Subscribed', e)
    }
  })
  const microchains = await sharedStore.getMicrochains()
  microchains.forEach((microchain) => {
    client.request({
      query: `subscription notifications($chainId: String!) {
        notifications(chainId: $chainId)
      }`,
      variables: {
        chainId: microchain
      }
    }).subscribe({
      next (data: unknown) {
        void basebridge.EventBus.bridge?.send('linera_subscription', data)
      }
    })
  })
}
