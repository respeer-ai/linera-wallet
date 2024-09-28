export interface OpenChainResp {
  chainId: string
  messageId: string
  certificateHash: string
}

export interface ChainsResp {
  list: string[]
  default: string
}

export interface ApplicationsResp {
  id: string
  link: string
  description: {
    bytecodeId: string
    creation: {
      chainId: string
      height: number
      index: number
    }
  }
}

export interface IncomingBundle {
  origin: {
    sender: string
    medium: string
  }
  bundle: {
    certificate_hash: string
    height: number
    messages: {
      authenticated_signer?: string
      grant: string
      index: number
      message: {
        System: {
          Credit: {
            amount: string
            source?: string
            target: string
          }
        }
      }
      refund_grant_to?: string
    }[]
  }
  action: unknown
}

export interface BlockResp {
  hash: string
  value: {
    executedBlock: {
      block: {
        chainId: string
        epoch: number
        incomingBundles: IncomingBundle[]
        operations: {
          System: {
            Transfer: {
              amount: string
              owner?: string
              recipient: {
                Account: {
                  chain_id: string
                  owner?: string
                }
                user_data?: string
              }
            }
          }
        }[]
        height: number
        timestamp: number
        authenticatedSigner: string
        previousBlockHash: string
      }
      outcome: {
        messages: {
          destination: {
            Recipient: string
          }
          authenticatedSigner?: string
          grant: string
          refundGrandTo: unknown
          kind: string
          message: {
            amount: string
            source: string
            target: string
          }
        }[][]
        stateHash: string
        oracleResponses: unknown[]
        events: {
          streamId: string
          key: number[]
          value: number[]
        }[]
      }
    }
    status: string
  }
}

export interface ChainAccountBalances {
  chain_balance: number
  account_balances: Record<string, number>
}

export type ChainAccountBalancesResp = Record<string, ChainAccountBalances>

export type PendingMessagesResp = IncomingBundle[]

export type CalculateBlockStateHashResp = string
