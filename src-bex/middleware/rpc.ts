import { RpcImplHandler } from './rpcimpl/types'
import {
  getProviderState,
  ethRequestAccounts,
  ping
} from './rpcimpl'
import { RpcMethod, RpcRequest } from './types'

const handlers = new Map<RpcMethod, RpcImplHandler>([
  [RpcMethod.GET_PROVIDER_STATE, getProviderState.getProviderStateHandler],
  [RpcMethod.ETH_REQUEST_ACCOUNTS, ethRequestAccounts.ethRequestAccountsHandler],
  [RpcMethod.CHECKO_PING, ping.pingHandler]
])

/* eslint-disable @typescript-eslint/no-unused-vars */
export const rpcHandler = async (req: RpcRequest): Promise<unknown> => {
  const handler = handlers.get(req.request.method as RpcMethod)
  if (!handler) {
    return Promise.reject(new Error('Invalid rpc method'))
  }
  return handler(req.request.params)
}

export * from './rpcimpl/types'
