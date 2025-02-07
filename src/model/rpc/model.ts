export interface _ChainAccountBalances {
  chain_balance: number
  account_balances: Record<string, number>
}

export type ChainAccountBalances = Record<string, _ChainAccountBalances>

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
  Account?: {
    chain_id: string
    owner?: string
  }
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

export type ERC20Token = {
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

export type ChainAccountOwner = {
  chain_id: string
  owner?: string /* User:$owner or Application:$applicationId */
}

export type ERC20Operation = {
  BaseOperation: {
    SubscribeCreatorChain
  }
  Transfer: { to: ChainAccountOwner; amount: string }
}

export type ERC20Message = {
  Transfer: {
    origin: ChainAccountOwner
    to: ChainAccountOwner
    amount: string
  }
}
