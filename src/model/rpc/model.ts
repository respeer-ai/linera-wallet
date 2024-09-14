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
