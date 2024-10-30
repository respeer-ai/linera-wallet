<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'
import { GET_ACCOUNT_BALANCE, GET_CHAIN_ACCOUNT_BALANCES } from 'src/graphql'
import { type GetAccountBalanceQuery, type GetChainAccountBalancesQuery } from 'src/__generated__/graphql/service/graphql'

const accountBalance = async (chainId: string, publicKey?: string): Promise<number> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(GET_ACCOUNT_BALANCE, {
    chainId,
    publicKey
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      resolve(Number((graphqlResult.rootData(res) as GetAccountBalanceQuery).balance))
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Get account balance: ${error}`))
    })
  })
}

const getChainAccountBalances = async (chainIds: string[], publicKeys: string[]): Promise<rpc.ChainAccountBalances> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(GET_CHAIN_ACCOUNT_BALANCES, {
    chainIds,
    publicKeys
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      resolve((graphqlResult.rootData(res) as GetChainAccountBalancesQuery).balances as rpc.ChainAccountBalances)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Get chain account balances: ${error}`))
    })
  })
}

defineExpose({
  accountBalance,
  getChainAccountBalances
})

</script>
