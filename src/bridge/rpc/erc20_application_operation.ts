import { db, rpc } from 'src/model'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { BALANCE_OF, MINT, TOKEN_METADATA, TRANSFER_ERC20 } from 'src/graphql'
import { graphqlResult } from 'src/utils'
import { uid } from 'quasar'
import * as dbBridge from '../db'
import { ApplicationOperation } from './application_operation'
import { MonoApplicationOperation } from './mono_application_opeartion'
import { Operation } from './operation'

export class ERC20ApplicationOperation {
  static subscribeWLineraCreationChain = async (chainId: string) => {
    await MonoApplicationOperation.subscribeCreationChainWithType(
      chainId,
      db.ApplicationType.WLINERA
    )
  }

  static subscribeCreationChain = async (
    chainId: string,
    applicationId: string,
    applicationType?: db.ApplicationType
  ) => {
    await MonoApplicationOperation.subscribeCreationChainWithId(
      chainId,
      applicationId,
      applicationType || db.ApplicationType.ERC20
    )
  }

  static requestApplication = async (
    chainId: string,
    applicationId: string,
    applicationType?: db.ApplicationType
  ): Promise<string | undefined> => {
    return await Operation.requestApplication(
      chainId,
      applicationId,
      applicationType || db.ApplicationType.ERC20
    )
  }

  static persistApplication = async (
    chainId: string,
    applicationId: string,
    applicationType?: db.ApplicationType
  ) => {
    const operationId = await ERC20ApplicationOperation.requestApplication(
      chainId,
      applicationId,
      applicationType
    )
    if (operationId) {
      if (!(await Operation.waitOperation(operationId))) {
        return Promise.reject('Failed request application')
      }
    }

    await ApplicationOperation.waitExistChainApplication(
      chainId,
      applicationId,
      10
    )

    await ERC20ApplicationOperation.subscribeCreationChain(
      chainId,
      applicationId
    )

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
        const token = graphqlResult.rootData(res) as rpc.ERC20Token
        if (!token.tokenMetadata) {
          // Add to ticker run let block subscription run it
          return reject('Invalid token metadata')
        }
        void dbBridge.Token.create({
          name: token.name,
          description: token.tokenMetadata.description,
          totalSupply: Number(token.totalSupply),
          ticker: token.symbol,
          tokenType: db.TokenType.Fungible,
          logo: token.tokenMetadata.logo.replace(/\s/g, '+'),
          applicationId,
          native: false,
          usdCurrency: 0,
          mono: true,
          discord: token.tokenMetadata.discord,
          telegram: token.tokenMetadata.telegram,
          twitter: token.tokenMetadata.twitter,
          website: token.tokenMetadata.website,
          github: token.tokenMetadata.github,
          mintable: token.tokenMetadata.mintable
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
      chain_id: chainId
    } as rpc.ChainAccountOwner
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

  static mint = async (
    chainId: string,
    applicationId: string,
    to: rpc.ChainAccountOwner | undefined,
    amount: number
  ) => {
    try {
      const variables = {
        to,
        amount: amount.toString()
      }
      const queryRespBytes = await ApplicationOperation.queryApplication(
        chainId,
        applicationId,
        MINT,
        'mint',
        variables
      )

      const operation = {
        operationType: db.OperationType.MINT,
        applicationType: db.ApplicationType.ERC20,
        operationId: uid(),
        microchain: chainId,
        operation: JSON.stringify({
          User: {
            application_id: applicationId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            bytes: queryRespBytes
          }
        } as rpc.Operation),
        graphqlQuery: MINT.loc?.source?.body,
        graphqlVariables: JSON.stringify(variables)
      } as db.ChainOperation
      await dbBridge.ChainOperation.create({ ...operation })
      return true
    } catch {
      return false
    }
  }

  static transfer = async (
    chainId: string,
    applicationId: string,
    to: rpc.ChainAccountOwner | undefined,
    amount: number
  ) => {
    try {
      const variables = {
        to,
        amount: amount.toString()
      }
      const queryRespBytes = await ApplicationOperation.queryApplication(
        chainId,
        applicationId,
        TRANSFER_ERC20,
        'transfer',
        variables
      )

      const operation = {
        operationType: db.OperationType.MINT,
        applicationType: db.ApplicationType.ERC20,
        operationId: uid(),
        microchain: chainId,
        operation: JSON.stringify({
          User: {
            application_id: applicationId,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            bytes: queryRespBytes
          }
        } as rpc.Operation),
        graphqlQuery: TRANSFER_ERC20.loc?.source?.body,
        graphqlVariables: JSON.stringify(variables)
      } as db.ChainOperation
      await dbBridge.ChainOperation.create({ ...operation })
      return true
    } catch (e) {
      console.log('Error', e)
      return false
    }
  }
}
