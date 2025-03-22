import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import {
  provideApolloClient,
  useMutation,
  useQuery
} from '@vue/apollo-composable'
import { _hex, graphqlResult } from 'src/utils'
import { dbBase, dbWallet } from 'src/controller'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import {
  OWNER_CHAINS,
  WALLET_INIT_WITHOUT_SECRET_KEY,
  OPEN_CHAIN
} from 'src/graphql'
import {
  type OpenChainMutation,
  type ClaimOutcome
} from 'src/__generated__/graphql/faucet/graphql'
import {
  type Chains,
  type OwnerChainsQuery
} from 'src/__generated__/graphql/service/graphql'
import { db } from 'src/model'
import * as dbBridge from '../db'

export class Microchain {
  static openChain = async (owner: string): Promise<ClaimOutcome> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Faucet)
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { mutate } = provideApolloClient(apolloClient)(() =>
      useMutation(OPEN_CHAIN)
    )
    const res = await mutate({
      owner
    })
    return (graphqlResult.rootData(res) as OpenChainMutation).claim
  }

  static initMicrochainStore = async (
    keyPair: Ed25519SigningKey,
    chainId: string,
    messageId: string
  ) => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    const apolloClient = new ApolloClient(options)

    const faucetUrl = (await dbBase.networks.toArray()).find(
      (el) => el.selected
    )?.faucetUrl

    const typeNameBytes = new TextEncoder().encode('Nonce::')
    const bytes = new Uint8Array([...typeNameBytes, ..._hex.toBytes(messageId)])
    const signature = {
      Ed25519: _hex.toHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)
    }

    const initializer = {
      public_key: _hex.toHex(keyPair.public().to_bytes().bytes),
      signature,
      faucetUrl,
      messageId
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { mutate } = provideApolloClient(apolloClient)(() =>
      useMutation(WALLET_INIT_WITHOUT_SECRET_KEY)
    )
    return await mutate({
      chainId,
      initializer
    })
  }

  static chains = async (publicKey: string): Promise<Chains> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          OWNER_CHAINS,
          {
            publicKey
          },
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        resolve((graphqlResult.rootData(res) as OwnerChainsQuery).ownerChains)
      })

      onError((error) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Get microchains: ${error}`))
      })
    })
  }

  static openMicrochain = async (): Promise<db.Microchain> => {
    const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
    if (!owner) return Promise.reject(new Error('Invalid owner'))
    const resp = await Microchain.openChain(owner?.owner)
    if (!resp) return Promise.reject(new Error('Invalid open chain'))

    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return Promise.reject(new Error('Invalid fingerprint'))

    const password = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!password) return Promise.reject(new Error('Invalid password'))
    const _password = db.decryptPassword(password, fingerPrint.fingerPrint)
    const privateKey = db.privateKey(owner, _password)
    const keyPair = Ed25519SigningKey.from_bytes(
      new Memory(_hex.toBytes(privateKey))
    )

    await Microchain.initMicrochainStore(
      keyPair,
      resp.chainId as string,
      resp.messageId as string
    )
    // The first block will be signed in BlockView

    const microchain = await dbBridge.Microchain.create(
      owner.owner,
      resp.chainId as string,
      resp.messageId as string,
      resp.certificateHash as string
    )

    return microchain
  }

  static importMicrochain = async (
    chainId: string,
    messageId: string,
    certificateHash: string
  ): Promise<db.Microchain> => {
    const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
    if (!owner) return Promise.reject(new Error('Invalid owner'))

    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return Promise.reject(new Error('Invalid fingerprint'))

    const password = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!password) return Promise.reject(new Error('Invalid password'))
    const _password = db.decryptPassword(password, fingerPrint.fingerPrint)
    const privateKey = db.privateKey(owner, _password)
    const keyPair = Ed25519SigningKey.from_bytes(
      new Memory(_hex.toBytes(privateKey))
    )

    await Microchain.initMicrochainStore(keyPair, chainId, messageId)
    // The first block will be signed in BlockView

    const microchain = await dbBridge.Microchain.create(
      owner.owner,
      chainId,
      messageId,
      certificateHash
    )

    return microchain
  }
}
