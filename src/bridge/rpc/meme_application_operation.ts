import { dbModel, rpcModel } from 'src/model'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { getClientOptionsWithBaseUrl } from 'src/apollo'
import { BALANCE_OF, MEME, TRANSFER_MEME } from 'src/graphql'
import { graphqlResult } from 'src/utils'
import { v4 as uuidv4 } from 'uuid'
import * as dbBridge from '../db'
import { Account } from './account'
import { ApplicationCreatorChain } from './application_creator_chain'
import * as constant from '../../const'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { stringify } from 'lossless-json'

export class MemeApplicationOperation {
  static persistApplication = async (applicationId: string) => {
    if (await dbBridge.Token.exists(applicationId)) return

    const microchain = await dbBridge.Microchain.anyMicrochain()
    if (!microchain) return

    const creatorChainId = await ApplicationCreatorChain.id(
      microchain.microchain,
      applicationId
    )
    if (!creatorChainId) return

    const options = getClientOptionsWithBaseUrl(
      constant.APPLICATION_URLS.PROXY_BASE,
      undefined as unknown as string,
      creatorChainId,
      applicationId
    )
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          MEME,
          {
            // NO PARAMETER
          },
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        const token = graphqlResult.data(res, 'meme') as rpcModel.MemeToken
        void dbBridge.Token.create({
          name: token.name,
          description: token.metadata.description,
          totalSupply: Number(token.totalSupply),
          ticker: token.ticker,
          tokenType: dbModel.TokenType.Fungible,
          logoStoreType: token.metadata.logoStoreType,
          logo: token.metadata.logo,
          applicationId,
          creatorChainId,
          native: false,
          usdCurrency: 0,
          discord: token.metadata.discord,
          telegram: token.metadata.telegram,
          twitter: token.metadata.twitter,
          website: token.metadata.website,
          github: token.metadata.github,
          liveStream: token.metadata.liveStream
        })
        resolve(undefined)
      })

      onError((e) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        console.log(`Query token metadata: ${e}`)
        reject(e)
      })
    })
  }

  static balanceOf = async (
    applicationId: string,
    chainId: string,
    owner: string
  ): Promise<number> => {
    const chainAccountOwner = {
      chainId,
      owner: Account.accountOwner(owner)
    } as rpcModel.Account
    const token = await dbBridge.Token.token(applicationId)
    if (!token) return 0
    const options = getClientOptionsWithBaseUrl(
      constant.APPLICATION_URLS.PROXY_BASE,
      undefined as unknown as string,
      token.creatorChainId,
      applicationId
    )
    if (!options) return 0
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          BALANCE_OF,
          {
            owner: Account.accountDescription(chainAccountOwner)
          },
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        const balance = Number(graphqlResult.data(res, 'balanceOf'))
        resolve(balance)
      })

      onError((error) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(`Query balanceOf: ${error}`)
      })
    })
  }

  static transfer = async (
    chainId: string,
    applicationId: string,
    to: rpcModel.Account | undefined,
    amount: number
  ): Promise<string> => {
    try {
      const variables = {
        to,
        amount: amount.toString()
      }
      // TODO: integrate meme serialization locally here
      const _queryBytes = await lineraWasm.graphql_deserialize_meme_operation(
        TRANSFER_MEME.loc?.source?.body as string,
        stringify(variables) as string
      )
      const queryBytes = JSON.parse(_queryBytes) as number[]
      const operationId = uuidv4()

      const operation = {
        operationType: dbModel.OperationType.TRANSFER,
        applicationType: dbModel.ApplicationType.MEME,
        operationId,
        microchain: chainId,
        operation: JSON.stringify({
          User: {
            applicationId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            bytes: queryBytes
          }
        } as rpcModel.Operation),
        graphqlQuery: TRANSFER_MEME.loc?.source?.body,
        graphqlVariables: JSON.stringify(variables)
      } as dbModel.ChainOperation
      await dbBridge.ChainOperation.create({ ...operation })
      return operationId
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
