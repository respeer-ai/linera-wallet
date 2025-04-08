import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import {
  provideApolloClient,
  useMutation,
  useQuery
} from '@vue/apollo-composable'
import { _hex, graphqlResult } from 'src/utils'
import { rpc } from 'src/model'
import { BALANCE, BALANCES, WALLET_INIT_PUBLIC_KEY } from 'src/graphql'
import {
  type ChainOwners,
  type BalanceQuery,
  type BalancesQuery
} from 'src/__generated__/graphql/service/graphql'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'

export class Account {
  static CHAIN = '0x00'

  static balance = async (chainId: string, owner?: string): Promise<number> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
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
    balances: rpc.Balances,
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
  ): Promise<rpc.Balances> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
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
            .balances as rpc.Balances
        )
      })

      onError((error) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Get chain account balances: ${error}`))
      })
    })
  }

  static initPublicKey = async (keyPair: Ed25519SigningKey) => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    const apolloClient = new ApolloClient(options)

    const typeNameBytes = new TextEncoder().encode('Nonce::')
    const publicKeyBytes = keyPair.public().to_bytes().bytes
    // Prefix '00' is for enum in public system
    const bytes = new Uint8Array([
      ...typeNameBytes,
      publicKeyBytes.length + 1,
      0,
      ...publicKeyBytes
    ])
    const signature = {
      Ed25519: _hex.toHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)
    }
    const publicKey = {
      Ed25519: _hex.toHex(keyPair.public().to_bytes().bytes)
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { mutate } = provideApolloClient(apolloClient)(() =>
      useMutation(WALLET_INIT_PUBLIC_KEY)
    )
    return await mutate({
      publicKey,
      signature
    })
  }
}
