import { UAParser } from 'ua-parser-js'
import CryptoJS, { AES, enc } from 'crypto-js'
import { sha3 } from 'hash-wasm'
// TODO: replace with web3.js utils
import { _hex } from 'src/utils'
import Identicon from 'identicon.js'
import { lineraLogo } from 'src/assets'
import { OriginRpcAuth } from 'app/src-bex/middleware/types'

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
  name: 'Linera Testnet',
  faucetUrl: 'http://172.16.31.73:40080',
  rpcSchema: HTTPSchema.HTTP,
  wsSchema: WSSchema.WS,
  host: '172.16.31.73',
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

export interface Password {
  id?: number
  password: string
  salt: string
  createdAt: number
  active: boolean
}

const deviceFingerPrint = (): string => {
  const parser = new UAParser()
  return `${parser.getBrowser().name || ''},
          ${parser.getCPU().architecture || ''},
          ${parser.getDevice().model || ''},
          ${parser.getDevice().type || ''},
          ${parser.getDevice().vendor || ''},
          ${parser.getEngine().name || ''},
          ${parser.getOS().name || ''}`
}

export const decryptPassword = (password: Password): string => {
  const fingerPrint = deviceFingerPrint()
  const now = password.createdAt
  const salt = password.salt
  const key = CryptoJS.SHA256(fingerPrint + now.toString() + salt).toString()
  const decrypted = AES.decrypt(password.password, key).toString(enc.Utf8)
  return decrypted
}

export const buildPassword = (password: string): Password | undefined => {
  const fingerPrint = deviceFingerPrint()
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

enum TokenType {
  Fungible = 'Fungible',
  NFT = 'NFT',
  Native = 'Native'
}

export interface Token {
  id?: number
  name: string
  ticker: string
  tokenType: TokenType
  icon: string
  applicationId?: string
  native: boolean
  usdCurrency: number
}

export const lineraToken = {
  name: 'Linera',
  ticker: 'TLINERA',
  tokenType: TokenType.Native,
  icon: lineraLogo,
  native: true
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
  ERC20
}

export interface NamedApplication {
  id?: number
  applicationType: ApplicationType
  name: string
  applicationId: string
  creatorChain: string
}

export const defaultNamedApplications = [
  {
    applicationType: ApplicationType.SWAP,
    name: 'swap',
    applicationId:
      'd95aa6a5f476326496a8ff23a20d3626726853f90f89adfd3692065bc1bff813365a265926d69564a9c9e1e02de9d8c4a809996e1cca9ec6ec0fe2fa9851b4fffeeeed172c74027e2675311c4ec3239dbe8e4b4fcf46b12e6f775523a002d64e010000000000000000000000',
    creatorChain:
      'feeeed172c74027e2675311c4ec3239dbe8e4b4fcf46b12e6f775523a002d64e'
  },
  {
    applicationType: ApplicationType.WLINERA,
    name: 'wlinera',
    applicationId:
      '07429a45a514b25c431c5fd1bdbcb13628992dd3f865a61505286f9340690806180cf9c01f40b4686b5b8b83c036acfa55796d03438e06e31b70f3653498ea5ca393137daba303e8b561cb3a5bff50efba1fb7f24950db28f1844b7ac2c1cf27010000000000000000000000',
    creatorChain:
      'a393137daba303e8b561cb3a5bff50efba1fb7f24950db28f1844b7ac2c1cf27'
  }
] as NamedApplication[]
