import { UAParser } from 'ua-parser-js'
import * as crypto from 'crypto'
import CryptoJS from 'crypto-js'

export interface MicrochainOwner {
  id?: number
  microchain: string
  owner: string
  balance: number
}

export interface Microchain {
  id?: number
  microchain: string
  balance: number
  messageId: string
  certificateHash: string
  faucetUrl: string
  name: string
  default: boolean
  selected: boolean
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

enum HTTPSchema {
  HTTP = 'http',
  HTTPS = 'https'
}

enum WSPSchema {
  WS = 'ws',
  WSS = 'wss'
}

export interface Network {
  id?: number
  icon: string
  name: string
  faucetUrl: string
  rpcSchema: HTTPSchema
  wsSchema: WSPSchema
  host: string
  port: number
  path: string
  selected: boolean
}

export const defaultNetwork = {
  icon: 'https://github.com/respeer-ai/linera-wallet/blob/master/src/assets/LineraLogo.png?raw=true',
  name: 'Linera Testnet',
  faucetUrl: 'http://172.16.31.73:8080',
  rpcSchema: HTTPSchema.HTTP,
  wsSchema: WSPSchema.WS,
  host: '172.16.31.73',
  port: 30080,
  path: '',
  selected: true
} as Network

export interface Password {
  id?: number
  password: string
  salt: string
  createdAt: number
  active: boolean
}

const deviceFingerPrint = (): string => {
  const parser = new UAParser()
  return `${parser.getBrowser().name || ''} +
          ${parser.getCPU().architecture || ''} +
          ${parser.getDevice().model || ''} +
          ${parser.getDevice().type || ''} +
          ${parser.getDevice().vendor || ''} +
          ${parser.getEngine().name || ''} +
          ${parser.getOS().name || ''} +
          ${parser.getUA()}`
}

export const decryptPassword = (password: Password): string => {
  const fingerPrint = deviceFingerPrint()
  const now = password.createdAt
  const salt = password.salt
  const key = CryptoJS.SHA256(fingerPrint + now.toString() + salt.toString())
  const decipher = crypto.createDecipheriv('aes-256-cbc', new Uint32Array(key.words), salt)
  let decrypted = decipher.update(password.password, 'utf-8', 'hex')
  decrypted += decipher.final('hex')
  return decrypted
}

export const buildPassword = (password: string): Password => {
  const fingerPrint = deviceFingerPrint()
  const now = Date.now()
  const salt = crypto.randomBytes(16)
  const key = CryptoJS.SHA256(fingerPrint + now.toString() + salt.toString())
  const cipher = crypto.createCipheriv('aes-256-cbc', new Uint32Array(key.words), salt)
  let encrypted = cipher.update(password, 'utf-8', 'hex')
  encrypted += cipher.final('hex')
  return {
    password: encrypted,
    salt: salt.toString(),
    createdAt: now,
    active: true
  }
}
