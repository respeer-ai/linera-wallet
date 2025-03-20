export type Balances = Record<
  string,
  {
    chainBalance: number
    ownerBalances: Record<string, number>
  }
>

export type Account = {
  chain_id: string
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
    application_id: string
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
    Claim?: {
      owner: string
      target_id: string
      recipient: Recipient
      amount: string
      user_data: Uint8Array | undefined
    }
    // TODO: OpenChain
    // TODO: ChangeOwnership
    // TODO: ChangeApplicationPermissions
    // TODO: Subscribe
    // TODO: Unsubscribe
    // TODO: Admin
    PublishByteCode?: {
      bytecode_id: string
    }
    PublishDataBlob?: {
      blob_hash: string
    }
    ReadBlob?: {
      blob_id: string
    }
    CreateApplication?: {
      bytecode_id: string
      parameters: Uint8Array
      instantiation_argument: Uint8Array
      required_application_ids: string[]
    }
    RequestApplication?: {
      chain_id: string
      application_id: string
    }
    CloseChain?: unknown
  }
  User?: {
    application_id: string
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
    logo_store_type: string
    logo: string
    telegram: string
    twitter: string
    website: string
    github: string
    description: string
    mintable: boolean
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
