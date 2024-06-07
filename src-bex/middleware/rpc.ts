import type { JsonRpcRequest, JsonRpcParams } from '@metamask/utils'
import { RpcImplHandler } from './rpcimpl/types'
import {
  getProviderState,
  ethRequestAccounts
} from './rpcimpl'

export enum RpcMethod {
  ADD_ETHEREUM_CHAIN = 'wallet_addEthereumChain',
  ETH_ACCOUNTS = 'eth_accounts',
  ETH_DECRYPT = 'eth_decrypt',
  ETH_CHAIN_ID = 'eth_chainId',
  ETH_GET_ENCRYPTION_PUBLIC_KEY = 'eth_getEncryptionPublicKey',
  ETH_GET_BLOCK_BY_NUMBER = 'eth_getBlockByNumber',
  ETH_REQUEST_ACCOUNTS = 'eth_requestAccounts',
  ETH_SIGN = 'eth_sign',
  ETH_SIGN_TRANSACTION = 'eth_signTransaction',
  ETH_SIGN_TYPED_DATA = 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V1 = 'eth_signTypedData_v1',
  ETH_SIGN_TYPED_DATA_V3 = 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
  GET_PROVIDER_STATE = 'metamask_getProviderState',
  LOG_WEB3_SHIM_USAGE = 'metamask_logWeb3ShimUsage',
  PERSONAL_SIGN = 'personal_sign',
  SEND_METADATA = 'metamask_sendDomainMetadata',
  SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
  TRANSACTION = 'transaction',
  WALLET_REQUEST_PERMISSIONS = 'wallet_requestPermissions',
  WATCH_ASSET = 'wallet_watchAsset',
  WATCH_ASSET_LEGACY = 'metamask_watchAsset'
}

const handlers = new Map<RpcMethod, RpcImplHandler>([
  [RpcMethod.GET_PROVIDER_STATE, getProviderState.getProviderStateHandler],
  [RpcMethod.ETH_REQUEST_ACCOUNTS, ethRequestAccounts.ethRequestAccountsHandler]
])

/* eslint-disable @typescript-eslint/no-unused-vars */
export const rpcHandler = async (req: JsonRpcRequest<JsonRpcParams>): Promise<unknown> => {
  const handler = handlers.get(req.method as RpcMethod)
  if (!handler) {
    return Promise.reject(new Error('Invalid rpc method'))
  }
  return handler()
}

export * from './rpcimpl/types'
