export const keys = (data: unknown) => {
  return (data as Record<string, unknown>).keys
}

export const entryValue = (data: unknown) => {
  return ((data as Record<string, unknown>).entry as Record<string, unknown>).value
}

export const keyValue = (data: unknown, key: string) => {
  return (data as Record<string, unknown>)[key]
}

export const entryValueKeyValue = (data: unknown, key: string) => {
  return (entryValue(data) as Record<string, unknown>)?.[key]
}

export const data = (result: unknown, key: string) => {
  return ((result as Record<string, unknown>).data as Record<string, unknown>)[key]
}

export interface Origin {
  sender: string
  medium: string
}

export interface Credit {
  target?: string
  amount: string
  source?: string
}

export interface SystemMessage {
  Credit: Credit
}

export interface Message {
  System: SystemMessage
}

export interface Event {
  certificate_hash: string
  height: number
  index: number
  authenticated_signer: string
  grant: string
  refund_grant_to: string
  timestamp: number
  message: Message
}

export interface IncomingBundle {
  origin: Origin
  action: string
  event: Event
}

export interface Owner {
  [key: string]: string
}

export interface TimeoutConfig {
  fast_round_duration?: number
  base_timeout: number
  timeout_increment: number
  fallback_duration: number
}

export interface NodeChainOwnership {
  super_owners: Owner
  owners: Owner
  multi_leader_rounds: number
  timeout_config: TimeoutConfig
}

export interface NodeChainManagerInfo {
  ownership: NodeChainOwnership
  leader?: Owner
  current_round: string
}

export interface Child {
  chain_id: string
  height: number
  index: number
}

export interface NodeChainInfo {
  chain_id: string
  epoch: number
  manager: NodeChainManagerInfo
  chain_balance: string
  block_hash: string
  timestamp: string
  next_block_height: number
}
