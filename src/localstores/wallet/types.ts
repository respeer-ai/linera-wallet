export interface Activity {
  sourceChain: string
  sourceAddress?: string
  targetChain: string
  targetAddress?: string
  amount: string
  blockHeight: number
  timestamp: number
}

export interface Microchain {
  chain_balance: number
  account_balance: number
}

export interface Account {
  microchains: Map<string, Microchain>
  privateKey: string
}
