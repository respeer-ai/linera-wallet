import {
  EndpointType,
  getClientOptionsWithBaseUrl,
  getClientOptionsWithEndpointType
} from 'src/apollo'
import { ApolloClient } from '@apollo/client/core'
import {
  provideApolloClient,
  useQuery,
  useSubscription
} from '@vue/apollo-composable'
import { graphqlResult } from 'src/utils'
import { dbModel } from 'src/model'
import { dbBase } from 'src/controller'
import { NOTIFICATIONS, BLOCK, SUBMIT_SIGNED_BLOCK } from 'src/graphql'
import {
  type BlockQuery,
  type NotificationsSubscription,
  type ConfirmedBlock,
  type SubmitSignedBlockBcsMutation,
  type InputUnsignedBlockProposal,
  type SignedBlock
} from 'src/__generated__/graphql/service/graphql'
import * as dbBridge from '../db'
import axios from 'axios'
import { parse, stringify } from 'lossless-json'
// import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import * as constant from 'src/const'
import { /* _Web3, */ Ed25519 } from 'src/crypto'

export class Block {
  static submitSignedBlock = async (
    chainId: string,
    block: InputUnsignedBlockProposal,
    signature: string,
    blobBytes: number[][],
    publicKeyHex: string
  ): Promise<string> => {
    const network = (await dbBridge.Network.selected()) as dbModel.Network
    if (!network) return Promise.reject('Invalid network')

    const sig = {
      Ed25519: {
        signature,
        public_key: publicKeyHex
      }
    }

    const signedBlock = {
      unsignedBlockProposal: block,
      signature: sig,
      blobBytes
    } as SignedBlock

    // TODO: we have to use bcs here due to issue https://github.com/linera-io/linera-protocol/issues/3734
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    // const bcsStr = await lineraWasm.bcs_serialize_signed_block(
    //   stringify(signedBlock) as string
    // )
    // const bcsBytes = Array.from(parse(bcsStr) as number[])
    // const bcsHex = _Web3.bytesToHexTrim0x(new Uint8Array(bcsBytes))

    console.log('Submitting signed block', signedBlock, chainId)

    return new Promise((resolve, reject) => {
      axios
        .post(
          network.rpcUrl,
          stringify({
            query: SUBMIT_SIGNED_BLOCK.loc?.source.body,
            variables: {
              chainId,
              block: signedBlock
            },
            operationName: 'submitSignedBlock'
          }),
          {
            responseType: 'text',
            transformResponse: [(data) => data as string]
          }
        )
        .then((res) => {
          const dataString = graphqlResult.rootData(res) as string
          const data = parse(dataString)
          const errors = (data as Record<string, unknown[]>).errors
          if (errors && errors.length > 0) {
            return reject(stringify(errors))
          }
          const submitBlockAndSignatureBcs = (
            data as Record<string, SubmitSignedBlockBcsMutation>
          ).data
          resolve(submitBlockAndSignatureBcs.submitSignedBlockBcs as string)
        })
        .catch((e) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.log(`Failed execute block with full materials: ${e}`)
          reject(e)
        })
    })
  }

  static signPayload = async (
    owner: dbModel.Owner,
    payload: Uint8Array
  ): Promise<string> => {
    const password = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!password) return Promise.reject('Invalid password')
    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return Promise.reject('Invalid fingerprint')
    const _password = dbModel.decryptPassword(password, fingerPrint.fingerPrint)
    const privateKeyHex = dbModel.privateKey(owner, _password)
    return await Ed25519.signWithKeccac256Hash(privateKeyHex, payload)
  }

  static publicKeyHex = async (owner: dbModel.Owner) => {
    const password = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!password) return Promise.reject('Invalid password')
    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return Promise.reject('Invalid fingerprint')
    const _password = dbModel.decryptPassword(password, fingerPrint.fingerPrint)
    const privateKeyHex = dbModel.privateKey(owner, _password)
    return Ed25519.publicHex(privateKeyHex)
  }

  static subscribe = async (
    chainId: string,
    memeChain: boolean,
    onNewBlock?: (hash: string) => void,
    onNewIncomingBundle?: () => void
  ): Promise<(() => void) | undefined> => {
    const baseUrlOptions = getClientOptionsWithBaseUrl(
      constant.APPLICATION_URLS.PROXY_BASE,
      constant.APPLICATION_URLS.PROXY_BASE_WS,
      undefined,
      undefined,
      undefined
    )
    const options = memeChain
      ? baseUrlOptions
      : await getClientOptionsWithEndpointType(EndpointType.Rpc)
    if (!options) return undefined
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ stop, onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useSubscription(NOTIFICATIONS, {
          chainId
        })
      )

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Fail subscribe to ${chainId}: ${error}`)
    })

    onResult((res) => {
      const notifications = (
        graphqlResult.rootData(res) as NotificationsSubscription
      ).notifications as unknown
      const reason = graphqlResult.keyValue(notifications, 'reason')
      const newBlock = graphqlResult.keyValue(reason, 'NewBlock')
      if (newBlock) {
        onNewBlock?.(graphqlResult.keyValue(newBlock, 'hash') as string)
      }
      if (!memeChain) {
        const newIncomingBundle = graphqlResult.keyValue(
          reason,
          'NewIncomingBundle'
        )
        if (newIncomingBundle) {
          onNewIncomingBundle?.()
        }
      }
    })

    return stop
  }

  static getBlockWithHash = async (
    chainId: string,
    hash?: string,
    memeChain?: boolean
  ): Promise<ConfirmedBlock | undefined> => {
    const baseUrlOptions = getClientOptionsWithBaseUrl(
      constant.APPLICATION_URLS.PROXY_BASE,
      constant.APPLICATION_URLS.PROXY_BASE_WS,
      undefined,
      undefined,
      undefined
    )
    const options = memeChain
      ? baseUrlOptions
      : await getClientOptionsWithEndpointType(EndpointType.Rpc)
    if (!options) return undefined
    const apolloClient = new ApolloClient(options)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const { /* result, refetch, fetchMore, */ onResult, onError } =
      provideApolloClient(apolloClient)(() =>
        useQuery(
          BLOCK,
          {
            chainId,
            hash
          },
          {
            fetchPolicy: 'network-only'
          }
        )
      )

    return new Promise((resolve, reject) => {
      onResult((res) => {
        resolve(
          (graphqlResult.rootData(res) as BlockQuery).block as ConfirmedBlock
        )
      })

      onError((error) => {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        reject(new Error(`Get block: ${error}`))
      })
    })
  }
}
