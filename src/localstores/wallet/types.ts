export interface Activity {
  sourceChain: string
  sourceAddress?: string
  targetChain: string
  targetAddress?: string
  amount: string
  blockHeight: number
  timestamp: number
  certificateHash: string
  grant: string
}

export interface Microchain {
  chain_balance: number
  account_balance: number
  // MessageId of OpenChain
  message_id: string
  faucet_url: string
}

export interface Account {
  microchains: Map<string, Microchain>
  privateKey: string
}
