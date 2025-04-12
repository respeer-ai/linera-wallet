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
import { dbModel } from 'src/model'
import * as dbBridge from '../db'
import { Account } from './account'

export class Microchain {
  static openChain = async (
    owner: string
  ): Promise<ClaimOutcome | undefined> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Faucet)
    if (!options) return undefined
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { mutate } = provideApolloClient(apolloClient)(() =>
      useMutation(OPEN_CHAIN)
    )
    owner = Account.accountOwner(owner)
    const res = await mutate({
      owner
    })
    return (graphqlResult.rootData(res) as OpenChainMutation).claim
  }

  static initMicrochainStore = async (
    owner: string,
    keyPair: Ed25519SigningKey,
    chainId: string,
    messageId: string
  ) => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    if (!options) return undefined
    const apolloClient = new ApolloClient(options)

    const faucetUrl = (await dbBase.networks.toArray()).find(
      (el) => el.selected
    )?.faucetUrl

    const typeNameBytes = new TextEncoder().encode('Nonce::')
    const bytes = new Uint8Array([...typeNameBytes, ..._hex.toBytes(messageId)])
    const signature = {
      Ed25519: _hex.toHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)
    }

    owner = Account.accountOwner(owner)
    const initializer = {
      owner,
      signature,
      faucetUrl
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { mutate } = provideApolloClient(apolloClient)(() =>
      useMutation(WALLET_INIT_WITHOUT_SECRET_KEY)
    )
    return await mutate({
      chainId,
      initializer,
      messageId
    })
  }

  static chains = async (owner: string): Promise<Chains | undefined> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    if (!options) return undefined
    const apolloClient = new ApolloClient(options)

    owner = Account.accountOwner(owner)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          OWNER_CHAINS,
          {
            owner
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

  static openMicrochain = async (): Promise<dbModel.Microchain> => {
    const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
    if (!owner) return Promise.reject(new Error('Invalid owner'))

    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return Promise.reject(new Error('Invalid fingerprint'))

    const password = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!password) return Promise.reject(new Error('Invalid password'))
    const _password = dbModel.decryptPassword(password, fingerPrint.fingerPrint)
    const privateKey = dbModel.privateKey(owner, _password)
    const keyPair = Ed25519SigningKey.from_bytes(
      new Memory(_hex.toBytes(privateKey))
    )

    // Initialize public key to RPC wallet firstly
    await Account.initPublicKey(keyPair)

    const resp = await Microchain.openChain(owner?.owner)
    if (!resp) return Promise.reject(new Error('Invalid open chain'))

    await Microchain.initMicrochainStore(
      owner.owner,
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
  ): Promise<dbModel.Microchain> => {
    const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
    if (!owner) return Promise.reject(new Error('Invalid owner'))

    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return Promise.reject(new Error('Invalid fingerprint'))

    const password = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!password) return Promise.reject(new Error('Invalid password'))
    const _password = dbModel.decryptPassword(password, fingerPrint.fingerPrint)
    const privateKey = dbModel.privateKey(owner, _password)
    const keyPair = Ed25519SigningKey.from_bytes(
      new Memory(_hex.toBytes(privateKey))
    )

    await Microchain.initMicrochainStore(
      owner.owner,
      keyPair,
      chainId,
      messageId
    )
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
