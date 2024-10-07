import { sharedStore } from '../../store'
import { RpcRequest } from '../types'
import gql from 'graphql-tag'
import { lineraGraphqlQueryHandler } from './lineragraphqldo'
import type { JsonRpcParams, JsonRpcRequest } from '@metamask/utils'

export const ethGetBalanceHandler = async (request?: RpcRequest) => {
  if (!request) {
    return Promise.reject(new Error('Invalid request'))
  }
  const account = (request.request.params as string[])[0]
  if (!account) {
    return Promise.reject(new Error('Invalid address'))
  }
  const _account = await sharedStore.getAccountWithPrefix(account)
  if (!_account) {
    return Promise.reject(new Error('Invalid address'))
  }
  const microchains = await sharedStore.getMicrochains(_account)
  if (!microchains.length) {
    return Promise.reject(new Error('Invalid microchains'))
  }

  const query = gql`
    query getChainAccountBalances(
      $chainIds: [String!]!
      $publicKeys: [String!]!
    ) {
      balances(chainIds: $chainIds, publicKeys: $publicKeys)
    }
  `
  return new Promise((resolve, reject) => {
    lineraGraphqlQueryHandler({
      origin: request.origin,
      name: request.name,
      favicon: request.favicon,
      request: {
        method: 'linera_graphqlQuery',
        params: {
          query: {
            query: query.loc?.source?.body,
            variables: {
              chainIds: microchains,
              publicKeys: [_account]
            },
            operationName: 'getChainAccountBalances'
          }
        } as JsonRpcParams
      } as JsonRpcRequest<JsonRpcParams>
    })
      .then((result) => {
        const balances = (result as Record<string, unknown>).balances as Record<
          string,
          unknown
        >
        let balance = 0
        Object.values(balances).forEach((_balance) => {
          const __balance = _balance as Record<string, unknown>
          balance += Number(__balance.chain_balance || 0)
          const accountBalances = __balance.account_balances as Record<
            string,
            string
          >
          Object.values(accountBalances).forEach((amount) => {
            balance += Number(amount)
          })
        })
        resolve(balance)
      })
      .catch((e: Error) => {
        reject(e)
      })
  })
}
