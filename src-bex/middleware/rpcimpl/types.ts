import { RpcRequest } from '../types'

export type RpcImplHandler = (request?: RpcRequest) => Promise<unknown>
