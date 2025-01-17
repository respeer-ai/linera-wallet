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
  CHAINS_WITH_PUBLIC_KEY,
  WALLET_INIT_WITHOUT_KEYPAIR,
  OPEN_CHAIN
} from 'src/graphql'
import {
  type OpenChainMutation,
  type ClaimOutcome
} from 'src/__generated__/graphql/faucet/graphql'
import {
  type Chains,
  type ChainsWithPublicKeyQuery
} from 'src/__generated__/graphql/service/graphql'
import { db } from 'src/model'
import * as dbBridge from '../db'
import { Operation } from './operation'
import { ApplicationOperation } from './application_operation'
import { SwapApplicationOperation } from './swap_application_operation'
import { ERC20ApplicationOperation } from './erc20_application_operation'
import { AMSApplicationOperation } from './ams_application_operation'

export class Microchain {
  static openChain = async (publicKey: string): Promise<ClaimOutcome> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Faucet)
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { mutate } = provideApolloClient(apolloClient)(() =>
      useMutation(OPEN_CHAIN)
    )
    const res = await mutate({
      publicKey
    })
    return (graphqlResult.rootData(res) as OpenChainMutation).claim
  }

  static initMicrochainStore = async (
    keyPair: Ed25519SigningKey,
    chainId: string,
    messageId: string,
    certificateHash: string
  ) => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    const apolloClient = new ApolloClient(options)

    const faucetUrl = (await dbBase.networks.toArray()).find(
      (el) => el.selected
    )?.faucetUrl

    const typeNameBytes = new TextEncoder().encode('Nonce::')
    const bytes = new Uint8Array([
      ...typeNameBytes,
      ..._hex.toBytes(certificateHash)
    ])
    const signature = _hex.toHex(
      keyPair.sign(new Memory(bytes)).to_bytes().bytes
    )

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { mutate } = provideApolloClient(apolloClient)(() =>
      useMutation(WALLET_INIT_WITHOUT_KEYPAIR)
    )
    return await mutate({
      publicKey: _hex.toHex(keyPair.public().to_bytes().bytes),
      signature,
      faucetUrl,
      chainId,
      messageId,
      certificateHash
    })
  }

  static chains = async (publicKey: string): Promise<Chains> => {
    const options = await getClientOptionsWithEndpointType(EndpointType.Rpc)
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          CHAINS_WITH_PUBLIC_KEY,
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
        resolve(
          (graphqlResult.rootData(res) as ChainsWithPublicKeyQuery)
            .chainsWithPublicKey
        )
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
    const resp = await Microchain.openChain(owner?.address)
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
      resp.messageId as string,
      resp.certificateHash as string
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

    await Microchain.initMicrochainStore(
      keyPair,
      chainId,
      messageId,
      certificateHash
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

  static importPresetApplications = async (microchain: db.Microchain) => {
    const _microchain = await dbBridge.Microchain.microchain(
      microchain.microchain
    )
    if (!_microchain?.opened) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          Microchain.importPresetApplications(microchain)
            .then(() => {
              resolve(undefined)
            })
            .catch((e) => {
              console.log('Failed import preset applications', e)
              reject(e)
            })
        }, 1000)
      })
    }

    let namedApplication =
      (await dbBridge.NamedApplication.namedApplicationWithType(
        db.ApplicationType.SWAP
      )) as db.NamedApplication
    if (!namedApplication) return Promise.reject('Invalid swap application')
    let operationId = await Operation.requestApplication(
      microchain.microchain,
      namedApplication.applicationId,
      db.ApplicationType.SWAP
    )
    if (operationId) {
      await Operation.waitOperation(operationId)
    }
    await ApplicationOperation.waitExistChainApplication(
      microchain.microchain,
      namedApplication.applicationId,
      60
    )
    await SwapApplicationOperation.subscribeCreationChain(microchain.microchain)

    namedApplication =
      (await dbBridge.NamedApplication.namedApplicationWithType(
        db.ApplicationType.WLINERA
      )) as db.NamedApplication
    if (!namedApplication) return Promise.reject('Invalid wlinera application')
    await ERC20ApplicationOperation.persistApplication(
      microchain.microchain,
      namedApplication.applicationId,
      db.ApplicationType.WLINERA
    )

    namedApplication =
      (await dbBridge.NamedApplication.namedApplicationWithType(
        db.ApplicationType.AMS
      )) as db.NamedApplication
    if (!namedApplication) return Promise.reject('Invalid ams application')
    operationId = await Operation.requestApplication(
      microchain.microchain,
      namedApplication.applicationId,
      db.ApplicationType.AMS
    )
    if (operationId) {
      await Operation.waitOperation(operationId)
    }
    await ApplicationOperation.waitExistChainApplication(
      microchain.microchain,
      namedApplication.applicationId,
      60
    )
    await AMSApplicationOperation.subscribeCreationChain(microchain.microchain)

    namedApplication =
      (await dbBridge.NamedApplication.namedApplicationWithType(
        db.ApplicationType.BLOB_GATEWAY
      )) as db.NamedApplication
    if (!namedApplication)
      return Promise.reject('Invalid blob gateway application')
    operationId = await Operation.requestApplication(
      microchain.microchain,
      namedApplication.applicationId,
      db.ApplicationType.BLOB_GATEWAY
    )
    if (operationId) {
      await Operation.waitOperation(operationId)
    }
    await ApplicationOperation.waitExistChainApplication(
      microchain.microchain,
      namedApplication.applicationId,
      60
    )
  }
}
