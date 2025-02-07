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
  blobGatewayUrl: 'https://testnet-archimedes.blobgateway.com',
  // blobGatewayUrl: 'http://testnet-archimedes.blobgateway.com:9081',
  rpcSchema: HTTPSchema.HTTPS,
  wsSchema: WSSchema.WSS,
  host: 'testnet-archimedes.respeer.ai',
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
  '0a53c50a4012157bccba877b890b778f684b58da172605da49d357c732f1361eaabeee56a723e29481416b86a8ba18a4d7012dfda927d56339b96fdc3d25b89b7f430ede6a5fbf9a8aa59286fb94e3b3490c0451826583a6a98b20b8cba1a0ab060000000000000000000000'
const defaultSwapCreatorChain =
  '7f430ede6a5fbf9a8aa59286fb94e3b3490c0451826583a6a98b20b8cba1a0ab'
const defaultWLineraAppId =
  '8f35d0a1a1ecec3406ce05f9b58809204c4b81a60512f42983950e077392eb03e09686709ef93e02de5689565008be6b57555877c8ea663fc039718d85f3ad2ad2040af57277cbc64d4d585535d0ec0a4e28fdbf58eba23c7d769673e541352c060000000000000000000000'
const defaultWLineraCreatorChain =
  'd2040af57277cbc64d4d585535d0ec0a4e28fdbf58eba23c7d769673e541352c'
const defaultAMSAppId =
  'bf9b75f4ad24a9940b1f0dc4dec6cbb89e72ca8b391ef4e8dd6357a84d28e5566478527ea66be16313d7ec46334a8293b8254ffc87e1267f1bf6d2e899e220d1a7fcebee0c372daafeec2cdb76b34e32caa9d8be1d2d6e9d9d597d6a314d52a2030000000000000000000000'
const defaultAMSCreatorChain =
  'a7fcebee0c372daafeec2cdb76b34e32caa9d8be1d2d6e9d9d597d6a314d52a2'
const defaultBlobGatewayAppId =
  '1792c2f3699e48288081499b0455b494cb5883eb9423aa186c89714ed106c6043af42487fe70116e7375c88c4fb24743bd734d209f53b952937148e726fa7041e24f3d30875f3f7e6e9830536b98b48a9b0538ee0ffcf8bf0722f9b8a724b2f20f0000000000000000000000'
const defaultBlobGatewayCreatorChain =
  'e24f3d30875f3f7e6e9830536b98b48a9b0538ee0ffcf8bf0722f9b8a724b2f2'

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
