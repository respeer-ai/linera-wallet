import { RpcRequest } from '../types'
import gql from 'graphql-tag'
import { lineraGraphqlQueryHandler } from './lineragraphqldo'
import type { JsonRpcParams, JsonRpcRequest } from '@metamask/utils'
import { dbBridge } from '../../../src/bridge'

export const ethGetBalanceHandler = async (request?: RpcRequest) => {
  if (!request) {
    return Promise.reject(new Error('Invalid request'))
  }
  const account = (request.request.params as string[])[0]
  if (!account) {
    return Promise.reject(new Error('Invalid address'))
  }
  const owner = await dbBridge.Owner.ownerWithPublicKeyPrefix(account)
  if (!owner) {
    return Promise.reject(new Error('Invalid address'))
  }

  const microchains = (
    await dbBridge.Microchain.microchains(
      0,
      0,
      undefined,
      undefined,
      owner.owner
    )
  ).map((el) => el.microchain)
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
              publicKeys: [owner.address]
            },
            operationName: 'Balances'
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
