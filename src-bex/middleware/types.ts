import type { JsonRpcParams, JsonRpcRequest } from '@metamask/utils'

export type MiddlewareImplHandler = (req: JsonRpcRequest<JsonRpcParams>, arg1?: JsonRpcParams) => Promise<void>
