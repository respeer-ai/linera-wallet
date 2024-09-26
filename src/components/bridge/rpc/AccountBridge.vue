<script setup lang='ts'>
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { rpc } from 'src/model'

const accountBalance = async (chainId: string, publicKey?: string): Promise<number> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getAccountBalance($chainId: String!, $publicKey: String) {
      balance(chainId: $chainId, publicKey: $publicKey)
    }
  `, {
    chainId,
    publicKey
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      resolve(graphqlResult.data(res, 'balance') as number)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Get account balance: ${error}`))
    })
  })
}

const getChainAccountBalances = async (chainIds: string[], publicKeys: string[]): Promise<rpc.ChainAccountBalancesResp> => {
  const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
  const apolloClient = new ApolloClient(options)

  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(gql`
    query getChainAccountBalances($chainIds: [String!]!, $publicKeys: [String!]!) {
      balances(chainIds: $chainIds, publicKeys: $publicKeys)
    }
  `, {
    chainIds,
    publicKeys
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      resolve(graphqlResult.data(res, 'balances') as rpc.ChainAccountBalancesResp)
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
