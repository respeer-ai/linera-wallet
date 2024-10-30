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

export type Recipient =
  | {
      Account: {
        chain_id: string
        owner?: string
      }
    }
  | 'Burn'

export type Operation =
  | {
      System:
        | {
            Transfer: {
              owner?: string
              recipient: Recipient
              amount: string
              user_data: number[]
            }
          }
        | {
            Claim: {
              owner: string
              target_id: string
              recipient: Recipient
              amount: string
              user_data: Int8Array | undefined
            }
          }
        | {
            // TODO: OpenChain
            // TODO: ChangeOwnership
            // TODO: ChangeApplicationPermissions
            // TODO: Subscribe
            // TODO: Unsubscribe
            // TODO: Admin
            PublishByteCode: {
              bytecode_id: string
            }
          }
        | {
            PublishDataBlob: {
              blob_hash: string
            }
          }
        | {
            ReadBlob: {
              blob_id: string
            }
          }
        | {
            CreateApplication: {
              bytecode_id: string
              parameters: Int8Array
              instantiation_argument: Int8Array
              required_application_ids: string[]
            }
          }
        | {
            RequestApplication: {
              chain_id: string
              application_id: string
            }
          }
        | 'CloseChain'
    }
  | {
      User: {
        application_id: string
        bytes: Int8Array
      }
    }
