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
}

export interface Owner {
  id?: number
  address: string
  owner: string
  privateKey: string
  salt: string
}
