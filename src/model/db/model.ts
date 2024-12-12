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
  blobGatewayUrl: 'http://210.209.69.38:9081',
  rpcSchema: HTTPSchema.HTTP,
  wsSchema: WSSchema.WS,
  host: '210.209.69.38',
  port: 30080,
  path: '',
  selected: true,
  preset: true
} as Network

export const rpcUrl = (network: Network) => {
  if (
    !network.rpcSchema?.length ||
    !network.host?.length ||
    network.port === undefined
  )
    return ''
  return `${network.rpcSchema}://${network.host}:${network.port}${
    network.path?.length > 1 ? '/' + network.path : ''
  }`
}

export const wsUrl = (network: Network) => {
  if (
    !network.wsSchema?.length ||
    !network.host?.length ||
    network.port === undefined
  )
    return ''
  return `${network.wsSchema}://${network.host}:${network.port}${
    network.path?.length > 1 ? '/ws/' + network.path : '/ws'
  }`
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
  '0c9e557b2c282e737ab631de4a88764b38c2f604f6b80df1fa0cbaecec239e06dc96ec01a1c237598853fedd337d2c8ad61f637b4dd41ac7aa1341c472af238158578dbca48967fd92b1344d740a74856ff11c830a7065947f110cff3cca118a070000000000000000000000'
const defaultSwapCreatorChain =
  '58578dbca48967fd92b1344d740a74856ff11c830a7065947f110cff3cca118a'
const defaultWLineraAppId =
  '3101219ec10a74a9c2eaa4da29d56eca2e498d289640e8c68c674315933d1675f59f2a99e8938b304bb64fecc1f26389163606d21f50b28ec94b127dfee748770ed72d08ba0061f8b686e1ba10ac1b75d0969a8a3b783b156f57e35cfe24680b070000000000000000000000'
const defaultWLineraCreatorChain =
  '0ed72d08ba0061f8b686e1ba10ac1b75d0969a8a3b783b156f57e35cfe24680b'
const defaultAMSAppId =
  '19da788bdf56d68baf06719ade3262271ba4ce692609a81d75d44d87a1cb8d34d1359d2d50b146407a36eb8c3f7226a065b26aa905ba12bd72855e2f6d9761d84daa0bf2c921563ceea2db85c749f1ec0f3e55d4c43707ef5af9b6c830f9cf6c030000000000000000000000'
const defaultAMSCreatorChain =
  '4daa0bf2c921563ceea2db85c749f1ec0f3e55d4c43707ef5af9b6c830f9cf6c'
const defaultBlobGatewayAppId =
  '6b1a6722636edf2f070b8563e27aaecb0ae12e05ea634917d55e0be86767c062f63ea0ad4991d52c422372831afda03e5e16ac9317d735d7b80e2ea6ff9fa0e7c49d016b7770044b52de1a358ed6e037f2ebaab9ede5007018170638133bfc560f0000000000000000000000'
const defaultBlobGatewayCreatorChain =
  'c49d016b7770044b52de1a358ed6e037f2ebaab9ede5007018170638133bfc56'

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
