import type { JsonRpcParams } from '@metamask/utils'

export interface RpcResult {
  err?: Error
  res?: unknown
}

export type RpcImplHandler = (arg1?: JsonRpcParams) => Promise<RpcResult>
