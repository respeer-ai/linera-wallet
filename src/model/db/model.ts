import CryptoJS, { AES, enc } from 'crypto-js'
import { sha3 } from 'hash-wasm'
// TODO: replace with web3.js utils
import { _hex } from '../../utils'
import Identicon from 'identicon.js'
import { OriginRpcAuth } from '../../../src-bex/middleware/types'

export interface MicrochainOwner {
  id?: number
  microchain: string
  owner: string
}

export interface Microchain {
  id?: number
  microchain: string
  messageId: string
  certificateHash: string
  name: string
  default: boolean
  imported: boolean // If it's imported in selected network
  opening: boolean
  opened: boolean
  openChainCertificateHash?: string
}

export const microchainAvatar = (microchain: Microchain) => {
  return (
    'data:image/png;base64,' +
    new Identicon(microchain.microchain, 420).toString()
  )
}

export interface Application {
  id?: number
  applicationId: string
  creationMicrochain: string
  creationHeight: number
  applicationIndex: number
}

export const ownerFromPublicKey = async (publicKey: string) => {
  const publicKeyBytes = _hex.toBytes(publicKey)
  const typeNameBytes = new TextEncoder().encode('PublicKey::')
  const bytes = new Uint8Array([...typeNameBytes, ...publicKeyBytes])
  return await sha3(bytes, 256)
}

export interface Owner {
  id?: number
  address: string
  owner: string
  privateKey: string
  salt: string
  name: string
  selected: boolean
}

export const DEFAULT_ACCOUNT_NAME = 'Account'

export const buildOwner = async (
  publicKey: string,
  privateKey: string,
  password: string,
  name: string
) => {
  const owner = await ownerFromPublicKey(publicKey)
  const salt = CryptoJS.lib.WordArray.random(16).toString(enc.Base64)
  const key = CryptoJS.SHA256(salt + password + salt).toString()
  const _privateKey = AES.encrypt(privateKey, key).toString()

  return {
    address: publicKey,
    owner,
    privateKey: _privateKey,
    salt,
    name,
    selected: true
  } as Owner
}

export const ownerAvatar = (owner: Owner) => {
  return 'data:image/png;base64,' + new Identicon(owner.address, 420).toString()
}

export const privateKey = (owner: Owner, password: string) => {
  const key = CryptoJS.SHA256(owner.salt + password + owner.salt).toString()
  return AES.decrypt(owner.privateKey, key).toString(enc.Utf8)
}

export enum HTTPSchema {
  HTTP = 'http',
  HTTPS = 'https'
}

export enum WSSchema {
  WS = 'ws',
  WSS = 'wss'
}

export interface Network {
  id?: number
  icon: string
  name: string
  faucetUrl: string
  blobGatewayUrl: string
  rpcSchema: HTTPSchema
  wsSchema: WSSchema
  host: string
  port: number
  path: string
  selected: boolean
  preset: boolean
}

export const defaultNetwork = {
  icon: 'https://github.com/respeer-ai/linera-wallet/blob/master/src/assets/LineraLogo.png?raw=true',
  name: 'Linera Testnet Archimedes ResPeer RPC',
  faucetUrl: 'https://faucet.testnet-archimedes.linera.net',
  // faucetUrl: 'http://faucet.testnet-archimedes.linera.net:40080',
  blobGatewayUrl: 'https://hk.testnet-archimedes.blobgateway.com',
  // blobGatewayUrl: 'http://testnet-archimedes.blobgateway.com:9081',
  rpcSchema: HTTPSchema.HTTPS,
  wsSchema: WSSchema.WSS,
  host: 'hk.testnet-archimedes.respeer.ai',
  // host: 'rpc.testnet-archimedes.respeer.ai',
  port: 443,
  path: '/rpc',
  selected: true,
  preset: true
} as Network

export const rpcUrl = (network: Network, ignoreEnv?: boolean) => {
  if (
    !network.rpcSchema?.length ||
    !network.host?.length ||
    network.port === undefined
  )
    return ''
  const httpBaseUrl =
    process.env.DEV && !ignoreEnv
      ? ''
      : `${network.rpcSchema}://${network.host}:${network.port}`
  return `${httpBaseUrl}${network.path?.length > 1 ? network.path : ''}`
}

export const wsUrl = (network: Network) => {
  if (
    !network.wsSchema?.length ||
    !network.host?.length ||
    network.port === undefined
  )
    return ''
  return `${network.wsSchema}://${network.host}:${network.port}/ws`
}

export interface DeviceFingerPrint {
  id?: number
  fingerPrint: string
}

export interface Password {
  id?: number
  password: string
  salt: string
  createdAt: number
  active: boolean
}

export const decryptPassword = (
  password: Password,
  fingerPrint: string
): string => {
  const now = password.createdAt
  const salt = password.salt
  const key = CryptoJS.SHA256(fingerPrint + now.toString() + salt).toString()
  const decrypted = AES.decrypt(password.password, key).toString(enc.Utf8)
  return decrypted
}

export const buildPassword = (
  password: string,
  fingerPrint: string
): Password | undefined => {
  const now = Date.now()
  const salt = CryptoJS.lib.WordArray.random(16).toString()
  const key = CryptoJS.SHA256(fingerPrint + now.toString() + salt).toString()
  const encrypted = AES.encrypt(password, key).toString()
  return {
    password: encrypted,
    salt,
    createdAt: now,
    active: true
  }
}

export enum TokenType {
  Fungible = 'Fungible',
  NFT = 'NFT',
  Native = 'Native'
}

export interface Token {
  id?: number
  name: string
  description: string
  totalSupply: number
  ticker: string
  tokenType: TokenType
  logo: string
  applicationId?: string
  native: boolean
  usdCurrency: number
  mono: boolean
  discord: string
  telegram: string
  twitter: string
  website: string
  github: string
  mintable: boolean
}

export const lineraToken = {
  name: 'Linera',
  description:
    'The first L1 blockchain infrastructure optimized for real-time applications',
  ticker: 'TLINERA',
  totalSupply: 2100000000,
  tokenType: TokenType.Native,
  logo: '',
  native: true,
  mono: true,
  discord: 'https://discord.com/invite/linera',
  telegram: 'http://t.me/linera_official',
  twitter: 'https://x.com/linera_io',
  website: 'https://linera.io',
  github: 'https://github.com/linera-io/linera-protocol',
  mintable: false
} as Token

export interface MicrochainFungibleTokenBalance {
  id?: number
  microchain: string
  tokenId: number
  balance: number
}

export interface MicrochainOwnerFungibleTokenBalance {
  id?: number
  microchain: string
  owner: string
  tokenId: number
  balance: number
}

export interface NFT {
  id?: number
  collectionId: string
  tokenId: number
  uri: string
  microchain: string
  owner: string
}

export interface Activity {
  id?: number
  microchain: string
  tokenId: number
  sourceChain: string
  sourceAddress?: string
  targetChain: string
  targetAddress?: string
  amount: string
  blockHeight: number
  timestamp: number
  certificateHash: string
  grant: string
}

export interface LoginTimestamp {
  id?: number
  timestamp: number
}

export interface RpcAuth extends OriginRpcAuth {
  id?: number
}

export interface OriginRpcMicrochain {
  id?: number
  origin: string
  publicKey: string
  microchain: string
}

export enum ApplicationType {
  SWAP,
  WLINERA,
  ERC20,
  ANONYMOUS,
  AMS,
  BLOB_GATEWAY
}

export interface NamedApplication {
  id?: number
  applicationType: ApplicationType
  name: string
  applicationId: string
  creatorChain: string
}

const defaultSwapAppId =
  'ca30b7409bfa4a373c2597ca63568ce698679c53ddeef9cc033aba955d2823b5f332095b5e2bb1757c03fd11fa58e930c7f6e28cc5cea0309f21db1dca210a22962a32f98ab686e2e6caa5b1cb343761e8d0928410a2bd427afcbb4e9a06d5a9060000000000000000000000'
const defaultSwapCreatorChain =
  '962a32f98ab686e2e6caa5b1cb343761e8d0928410a2bd427afcbb4e9a06d5a9'
const defaultWLineraAppId =
  '716c598da8db64bd276d6efbae5c67842c9caf16eade6587d51b0ff001e4a7b407b5e65376146b60763dfc1776a4353e15e3333f7ba53ccc88756f2b0d6308d29ab0c2036a048e4f1132a776a2fdfb1fa37345e15601f95229e559463d91aa31060000000000000000000000'
const defaultWLineraCreatorChain =
  '9ab0c2036a048e4f1132a776a2fdfb1fa37345e15601f95229e559463d91aa31'
const defaultAMSAppId =
  '61afe169cf65c3798ebe9f968f0317bfb37a1087a131efa180308ba3d82e8ba53f73938f84203fb4f8cbc8f0a0eab6101872be430b536c756d5bfa7855d2a868a680686fd185b5bf96f9b8515523b05d1ed92010dc617a21fa9ecdaa7b63b53f030000000000000000000000'
const defaultAMSCreatorChain =
  'a680686fd185b5bf96f9b8515523b05d1ed92010dc617a21fa9ecdaa7b63b53f'
const defaultBlobGatewayAppId =
  '1bb9526a4624c2c29623e5cb699cf52315f77337055de65349b8116e212828db7103993ccfcf753b78737131616f7aac2d001b26de2da03374ddbba0aeca0548a2acd39056bf5a5591e5f7ecc1869f8b998eeb32ca89f98d871f135375a50d110f0000000000000000000000'
const defaultBlobGatewayCreatorChain =
  'a2acd39056bf5a5591e5f7ecc1869f8b998eeb32ca89f98d871f135375a50d11'

export const defaultNamedApplications = [
  {
    applicationType: ApplicationType.SWAP,
    name: 'swap',
    applicationId: defaultSwapAppId,
    creatorChain: defaultSwapCreatorChain
  },
  {
    applicationType: ApplicationType.WLINERA,
    name: 'wlinera',
    applicationId: defaultWLineraAppId,
    creatorChain: defaultWLineraCreatorChain
  },
  {
    applicationType: ApplicationType.AMS,
    name: 'ams',
    applicationId: defaultAMSAppId,
    creatorChain: defaultAMSCreatorChain
  },
  {
    applicationType: ApplicationType.BLOB_GATEWAY,
    name: 'blob',
    applicationId: defaultBlobGatewayAppId,
    creatorChain: defaultBlobGatewayCreatorChain
  }
] as NamedApplication[]

export enum OperationType {
  LEGACY_REQUEST_SUBSCRIBE = 'requestSubscribe',
  SUBSCRIBE_CREATOR_CHAIN = 'subscribeCreatorChain',
  REQUEST_APPLICATION = 'requestApplication',
  TRANSFER = 'transfer',
  MINT = 'mint',
  ANONYMOUS = 'ANONYMOUS'
}

export enum OperationState {
  CREATED = 1,
  EXECUTING,
  EXECUTED,
  CONFIRMED,
  FAILED
}

export interface ChainOperation {
  id?: number
  operationId: string
  microchain: string
  operationType?: OperationType
  applicationId: string
  applicationType?: ApplicationType
  operation: string
  graphqlQuery?: string
  graphqlVariables?: string
  certificateHash?: string
  stateHash?: string
  state: OperationState
  createdAt?: number
  firstProcessedAt?: number
  failedAt?: number
  failReason?: string
}
