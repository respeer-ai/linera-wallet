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
