import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import {
  provideApolloClient,
  useMutation,
  useQuery
} from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { dbBase, dbWallet } from 'src/controller'
import {
  OWNER_CHAINS,
  OPEN_CHAIN,
  IMPORT_CHAIN
} from 'src/graphql'
import {
  type OpenChainMutation
} from 'src/__generated__/graphql/faucet/graphql'
import {
  type Chains,
  type OwnerChainsQuery
} from 'src/__generated__/graphql/service/graphql'
import { dbModel } from 'src/model'
import * as dbBridge from '../db'
import { Account } from './account'
import { _Web3, Ed25519 } from 'src/crypto'
import { ChainDescription } from 'src/model/rpc/model'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { stringify } from 'lossless-json'

export class Microchain {
  static openChain = async (
    owner: string
  ): Promise<ChainDescription | undefined> => {
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
    return (graphqlResult.rootData(res) as OpenChainMutation).claim as unknown
  }

  static initMicrochainStore = async (
    owner: string,
    secretKeyHex: string,
    chainId: string,
    creatorChainId: string
  ) => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    if (!options) return undefined
    const apolloClient = new ApolloClient(options)

    const typeNameBytes = new TextEncoder().encode('Nonce::')
    const bytes = new Uint8Array([
      ...typeNameBytes,
      ..._Web3.hexToBytes(chainId)
    ])
    const signature = {
      Ed25519: {
        signature: await Ed25519.signWithKeccac256Hash(secretKeyHex, bytes),
        public_key: Ed25519.publicHex(secretKeyHex)
      }
    }

    owner = Account.accountOwner(owner)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { mutate } = provideApolloClient(apolloClient)(() =>
      useMutation(IMPORT_CHAIN)
    )
    return await mutate({
      owner,
      chainId,
      signature,
      creatorChainId
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
    const privateKeyHex = dbModel.privateKey(owner, _password)

    const chainDescription = await Microchain.openChain(owner?.owner)
    if (!chainDescription) return Promise.reject(new Error('Failed open chain'))

    // TODO: workaround for u64 overflow
    const chainId = await lineraWasm.chain_description_id((stringify(chainDescription) as string).replace('18446744073709552000', '18446744073709551615'))
    interface Resp {
      origin: {
        Child: {
          parent: string
        }
      }
    }
    const creatorChainId = (chainDescription as Resp).origin.Child.parent

    console.log('Open microchain', chainId, creatorChainId)

    await Microchain.initMicrochainStore(
      owner.owner,
      privateKeyHex,
      chainId,
      creatorChainId
    )
    // The first block will be signed in BlockView

    const microchain = await dbBridge.Microchain.create(
      owner.owner,
      chainId,
      creatorChainId
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
    const privateKeyHex = dbModel.privateKey(owner, _password)

    await Microchain.initMicrochainStore(
      owner.owner,
      privateKeyHex,
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
