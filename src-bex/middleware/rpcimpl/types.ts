import type { JsonRpcParams } from '@metamask/utils'

export type RpcImplHandler = (params?: JsonRpcParams) => Promise<unknown>
