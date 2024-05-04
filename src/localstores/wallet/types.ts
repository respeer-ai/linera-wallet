export interface Microchain {
  chain_balance: number
  account_balance: number
}

export interface Account {
  microchains: Map<string, Microchain>
  privateKey: string
}
