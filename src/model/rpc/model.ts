import { StoreType } from '../db/model'

export type Balances = Record<
  string,
  {
    chainBalance: number
    ownerBalances: Record<string, number>
  }
>

export type Account = {
  chainId: string
  owner: string
}

export type Round =
  | 'Fast'
  | { MultiLeader: number }
  | { SingleLeader: number }
  | { Validator: number }

export type Origin = {
  sender: string
  medium: string
}

export type Recipient = {
  Account?: Account
  Burn?: unknown
}

export type Message = {
  System: {
    Credit: {
      amount: string
      source?: string
      target: string
    }
  }
  User: {
    applicationId: string
    bytes: Uint8Array
  }
}

export type Operation = {
  System?: {
    Transfer?: {
      owner?: string
      recipient: Recipient
      amount: string
    }
  }
  User?: {
    applicationId: string
    // Bytes in the operation will be stored into database with stringify. Uint8Array will be serialized to map so we just use number array
    bytes: number[]
  }
}

export type Destination = {
  Recipient: string
  Subscribers: Uint8Array
}

export type MemeToken = {
  initialSupply: string
  totalSupply: string
  name: string
  ticker: string
  decimal: number
  metadata: {
    logoStoreType: StoreType
    logo: string
    description: string
    twitter?: string
    telegram?: string
    discord?: string
    website?: string
    github?: string
    liveStream?: string
  }
  virtualInitialLiquidity: boolean
  initialLiquidity: {
    fungibleAmount: string
    nativeAmount: string
  }
}

export type MemeOperation = {
  Transfer: {
    to: Account
    amount: string
  }
}

export type MemeMessage = {
  Transfer: {
    from: Account
    to: Account
    amount: string
  }
}
