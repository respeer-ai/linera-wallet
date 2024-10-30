export const keys = (data: unknown) => {
  return (data as Record<string, unknown>).keys
}

export const entryValue = (data: unknown) => {
  return ((data as Record<string, unknown>).entry as Record<string, unknown>)
    .value
}

export const keyValue = (data: unknown, key: string) => {
  return (data as Record<string, unknown>)[key]
}

export const entryValueKeyValue = (data: unknown, key: string) => {
  return (entryValue(data) as Record<string, unknown>)?.[key]
}

export const data = (result: unknown, key: string) => {
  return ((result as Record<string, unknown>).data as Record<string, unknown>)[
    key
  ]
}

export const rootData = (result: unknown) => {
  return (result as Record<string, unknown>).data
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

export interface IncomingMessage {
  origin: Origin
  action: string
  event: Event
}
