import type { JsonRpcParams } from '@metamask/utils'

export const lineraGraphqlMutationHandler = async (params?: JsonRpcParams) => {
  console.log(params)
  return Promise.resolve('pong')
}

export const lineraGraphqlQueryHandler = async (params?: JsonRpcParams) => {
  console.log(params)
  return Promise.resolve('pong')
}

export const lineraGraphqlSubscriptionHandler = async (params?: JsonRpcParams) => {
  console.log(params)
  return Promise.resolve('pong')
}
