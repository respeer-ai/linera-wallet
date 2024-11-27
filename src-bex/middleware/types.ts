import type { JsonRpcParams, JsonRpcRequest } from '@metamask/utils'

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
  CHECKO_PING = 'checko_ping',
  LINERA_SUBSCRIBE = 'linera_subscribe',
  LINERA_UNSUBSCRIBE = 'linera_unsubscribe',
  LINERA_GRAPHQL_MUTATION = 'linera_graphqlMutation',
  LINERA_GRAPHQL_QUERY = 'linera_graphqlQuery',

  ETH_GET_BALANCE = 'eth_getBalance'
}

export const RpcMethods = Object.values(RpcMethod)

export interface RpcRequest {
  origin: string
  name: string
  favicon: string
  request: JsonRpcRequest<JsonRpcParams>
}

export type MiddlewareImplHandler = (
  req: RpcRequest
) => Promise<string | undefined>

export type MiddlewareInterceptorHandler = (req: RpcRequest) => Promise<void>

export enum PopupRequestType {
  CONFIRMATION = 'confirmation',
  EXECUTION = 'execution'
}

export interface OriginRpcAuth {
  origin: string
  publicKey: string
  chainId: string
  method: RpcMethod
  applicationId?: string
  operation?: string
  expiredAt: number
}

export interface GraphqlQuery {
  operationName: string
  query: string
  variables: Record<string, unknown>
}

export interface RpcGraphqlQuery {
  publicKey?: string
  applicationId?: string
  query: GraphqlQuery
}

export interface LineraOperation {
  operationId: string
  operation?: string
}

export const lineraGraphqlQueryApplicationId = (request: RpcRequest) => {
  return (request?.request?.params as unknown as RpcGraphqlQuery)?.applicationId
}

export const lineraGraphqlQueryPublicKey = (request: RpcRequest) => {
  return (request?.request?.params as unknown as RpcGraphqlQuery)?.publicKey
}

export const lineraGraphqlMutationQueryWithQuery = (query: string) => {
  const patterns = query?.match(/[)\s].*{\s+([a-zA-Z]+)[($\s]/)
  if (!patterns) return undefined
  if (patterns?.length < 2) return undefined
  return patterns[1][0].toUpperCase() + patterns[1].slice(1)
}

export const lineraGraphqlMutationOperation = (request: RpcRequest) => {
  const query = (
    request?.request?.params as unknown as RpcGraphqlQuery
  )?.query?.query?.replace('\n', '')
  return lineraGraphqlMutationQueryWithQuery(query)
}

export enum GraphqlOperation {
  QUERY,
  MUTATION
}

export const lineraGraphqlOperation = (request: RpcRequest) => {
  const query = (
    request?.request?.params as unknown as RpcGraphqlQuery
  )?.query?.query?.replace('\n', '')
  const patterns = query?.match(/\s+([a-zA-Z]+)\s+/)
  if (!patterns) return undefined
  if (patterns?.length < 2) return undefined
  if (patterns[1] === 'query') return GraphqlOperation.QUERY
  return GraphqlOperation.MUTATION
}

export const lineraGraphqlQuery = (request: RpcRequest) => {
  return (request?.request?.params as unknown as RpcGraphqlQuery)?.query
}
