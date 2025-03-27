export type Balances = Record<
  string,
  {
    chainBalance: number
    ownerBalances: Record<string, number>
  }
>

export type Account = {
  chainId: string
  owner?: string
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
    bytes: Uint8Array
  }
}

export type Destination = {
  Recipient: string
  Subscribers: Uint8Array
}

export type MemeToken = {
  name: string
  symbol: string
  totalSupply: string
  tokenMetadata: {
    discord: string
    logoStoreType: string
    logo: string
    telegram: string
    twitter: string
    website: string
    github: string
    description: string
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
