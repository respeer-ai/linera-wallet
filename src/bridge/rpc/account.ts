import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpcModel } from 'src/model'
import { BALANCE, BALANCES } from 'src/graphql'
import {
  type ChainOwners,
  type BalanceQuery,
  type BalancesQuery
} from 'src/__generated__/graphql/service/graphql'

export class Account {
  static CHAIN = '0x00'

  static balance = async (chainId: string, owner?: string): Promise<number> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    if (!options) return 0
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          BALANCE,
          {
            chainId,
            owner
          },
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        resolve(Number((graphqlResult.rootData(res) as BalanceQuery).balance))
      })

      onError((error) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Get account balance: ${error}`))
      })
    })
  }

  static ownerBalance = (
    balances: rpcModel.Balances,
    chainId: string,
    owner: string
  ) => {
    return balances[chainId].ownerBalances[Account.accountOwner(owner)] || 0
  }

  static accountOwner = (owner: string) => {
    return owner.startsWith('0x') ? owner : '0x' + owner
  }

  static balances = async (
    chainOwners: Array<ChainOwners>
  ): Promise<rpcModel.Balances | undefined> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    if (!options) return undefined
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          BALANCES,
          {
            chainOwners
          },
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        resolve(
          (graphqlResult.rootData(res) as BalancesQuery)
            .balances as rpcModel.Balances
        )
      })

      onError((error) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Get chain account balances: ${error}`))
      })
    })
  }

  static accountDescription = (account: rpcModel.Account) => {
    return `${account.chainId}:${Account.accountOwner(account.owner)}`
  }
}
