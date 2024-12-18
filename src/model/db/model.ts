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
  // faucetUrl: 'https://faucet.testnet-archimedes.linera.net',
  faucetUrl: 'http://faucet.testnet-archimedes.linera.net:40080',
  // blobGatewayUrl: 'http://210.209.69.38:9081',
  blobGatewayUrl: 'http://testnet-archimedes.blobgateway.com:9081',
  rpcSchema: HTTPSchema.HTTP,
  wsSchema: WSSchema.WS,
  // host: '210.209.69.38',
  host: 'rpc.testnet-archimedes.respeer.ai',
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
'0c9e557b2c282e737ab631de4a88764b38c2f604f6b80df1fa0cbaecec239e06876cc69c3196313037c9cd54c232ab80ca62c5e89018650840323a7f00fa4fc50aac8235c4f40075afb4b76df9883ce1a743b600ae765fedc0264bdd149cdc1d050000000000000000000000'
const defaultSwapCreatorChain =
'0aac8235c4f40075afb4b76df9883ce1a743b600ae765fedc0264bdd149cdc1d'
const defaultWLineraAppId =
'd9c33b013ffcdc4c259d7bf10a28ceccfc842f80267f77d1c248f2ebd34f03f2f59f2a99e8938b304bb64fecc1f26389163606d21f50b28ec94b127dfee748779d75ad0766c7d5fee02c8a84700411828eb56cc27e0018fbab8916e9d836a827050000000000000000000000'
const defaultWLineraCreatorChain =
'9d75ad0766c7d5fee02c8a84700411828eb56cc27e0018fbab8916e9d836a827'
const defaultAMSAppId =
'19da788bdf56d68baf06719ade3262271ba4ce692609a81d75d44d87a1cb8d34d1359d2d50b146407a36eb8c3f7226a065b26aa905ba12bd72855e2f6d9761d81cab8114d56a7388ce39e42a08ccfb8a6198d109b63cdc23cf20815a6df89ef2010000000000000000000000'
const defaultAMSCreatorChain =
'1cab8114d56a7388ce39e42a08ccfb8a6198d109b63cdc23cf20815a6df89ef2'
const defaultBlobGatewayAppId =
'18121c59938cd567f9dff016e39331ede2cc8fc1516160b0f16267ba7801b4a75a2c73580d6839233c4ab9fb875ceeb0ecfe205d5c866b86bf5378901806d82801745e6b1b2335e6fea9034392768a0647642c9959ee95ad70fbb17f49ba10320d0000000000000000000000'
const defaultBlobGatewayCreatorChain =
'01745e6b1b2335e6fea9034392768a0647642c9959ee95ad70fbb17f49ba1032'

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
