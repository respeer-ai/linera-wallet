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

export interface BlockResp {
  hash: string
  value: {
    executedBlock: {
      block: {
        chainId: string
        epoch: number
        incomingBundles: {
          origin: unknown
          bundle: unknown
          action: unknown
        }[]
        operations: unknown[]
        height: number
        timestamp: number
        authenticatedSigner: string
        previousBlockHash: string
      }
      outcome: {
        messages: {
          destination: string
          authenticatedSigner: string
          grant: string
          refundGrandTo: unknown
          kind: string
          message: unknown
        }
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
