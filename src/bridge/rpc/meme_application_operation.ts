import { db, rpc } from 'src/model'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { BALANCE_OF, TOKEN_METADATA, TRANSFER_MEME } from 'src/graphql'
import { graphqlResult } from 'src/utils'
import { v4 as uuidv4 } from 'uuid'
import * as dbBridge from '../db'
import { ApplicationOperation } from './application_operation'

export class MemeApplicationOperation {
  static persistApplication = async (
    chainId: string,
    applicationId: string,
    applicationType?: db.ApplicationType
  ) => {
    if (await dbBridge.Token.exists(applicationId)) return

    const options = await getClientOptionsWithEndpointType(
      EndpointType.Application,
      chainId,
      applicationId
    )
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          TOKEN_METADATA,
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
        const token = graphqlResult.rootData(res) as rpc.MemeToken
        if (!token.tokenMetadata) {
          // Add to ticker run let block subscription run it
          return setTimeout(() => {
            MemeApplicationOperation.persistApplication(
              chainId,
              applicationId,
              applicationType
            )
              .then(() => {
                resolve(undefined)
              })
              .catch((e) => {
                console.log('Failed get token metadata', e)
              })
          }, 1000)
        }
        void dbBridge.Token.create({
          name: token.name,
          description: token.tokenMetadata.description,
          totalSupply: Number(token.totalSupply),
          ticker: token.symbol,
          tokenType: db.TokenType.Fungible,
          logoStoreType: token.tokenMetadata.logoStoreType as db.StoreType,
          logo: token.tokenMetadata.logo,
          applicationId,
          native: false,
          usdCurrency: 0,
          mono: true,
          discord: token.tokenMetadata.discord,
          telegram: token.tokenMetadata.telegram,
          twitter: token.tokenMetadata.twitter,
          website: token.tokenMetadata.website,
          github: token.tokenMetadata.github
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
    chainId: string,
    applicationId: string,
    publicKey?: string
  ): Promise<number> => {
    const chainAccountOwner = {
      chainId
    } as rpc.Account
    if (publicKey) {
      const owner = await db.ownerFromPublicKey(publicKey)
      chainAccountOwner.owner = `User:${owner}`
    }
    const options = await getClientOptionsWithEndpointType(
      EndpointType.Application,
      chainId,
      applicationId
    )
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          BALANCE_OF,
          {
            owner: chainAccountOwner
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
    to: rpc.Account | undefined,
    amount: number
  ): Promise<string> => {
    try {
      const variables = {
        to,
        amount: amount.toString()
      }
      const queryRespBytes = await ApplicationOperation.queryApplication(
        chainId,
        applicationId,
        TRANSFER_MEME,
        'transfer',
        variables
      )

      const operationId = uuidv4()

      const operation = {
        operationType: db.OperationType.MINT,
        applicationType: db.ApplicationType.MEME,
        operationId,
        microchain: chainId,
        operation: JSON.stringify({
          User: {
            applicationId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            bytes: queryRespBytes
          }
        } as rpc.Operation),
        graphqlQuery: TRANSFER_MEME.loc?.source?.body,
        graphqlVariables: JSON.stringify(variables)
      } as db.ChainOperation
      await dbBridge.ChainOperation.create({ ...operation })
      return operationId
    } catch (e) {
      return Promise.reject(e)
    }
  }
}
