import * as domain from './domain'

export enum HTTPSchema {
  HTTP = 'http',
  HTTPS = 'https'
}
export const HTTPSchemas = Object.values(HTTPSchema)

export enum WSSchema {
  WS = 'ws',
  WSS = 'wss'
}
export const WSSchemas = Object.values(WSSchema)

export const toUrl = (
  schema: HTTPSchema | WSSchema,
  host: string,
  port: number
) => {
  return schema + '://' + host + ':' + port.toString()
}

export const formalizeSchema = (url: string) => {
  url = url.replace(
    'http://',
    process.env.NODE_ENV === 'production' ? 'https://' : 'http://'
  )
  url = url.replace(
    'ws://',
    process.env.NODE_ENV === 'production' ? 'wss://' : 'ws://'
  )
  url = url.replace(
    ':80',
    process.env.NODE_ENV === 'production' ? ':443' : ':80'
  )
  return url
}

const URLS = [
  `http://api.${domain.SUB_DOMAIN}blobgateway.com/api/blobs/chains/${domain.BLOB_GATEWAY_CHAIN_ID}/applications/${domain.BLOB_GATEWAY_APPLICATION_ID}`,
  `http://api.${domain.SUB_DOMAIN}ams.respeer.ai/api/ams/chains/${domain.AMS_CHAIN_ID}/applications/${domain.AMS_APPLICATION_ID}`,
  `http://api.${domain.SUB_DOMAIN}linerameme.fun/api/proxy/chains/${domain.PROXY_CHAIN_ID}/applications/${domain.PROXY_APPLICATION_ID}`,
  `http://api.${domain.SUB_DOMAIN}lineraswap.fun/api/swap/chains/${domain.SWAP_CHAIN_ID}/applications/${domain.SWAP_APPLICATION_ID}`,
  `http://api.${domain.SUB_DOMAIN}linerameme.fun/api/proxy`,
  `ws://api.${domain.SUB_DOMAIN}linerameme.fun/api/proxy/ws`,
  `http://api.${domain.SUB_DOMAIN}lineraswap.fun/api/swap`,
  `ws://api.${domain.SUB_DOMAIN}lineraswap.fun/api/swap/ws`,
  `http://api.${domain.SUB_DOMAIN}lineraswap.fun/api/kline`,
  `ws://api.${domain.SUB_DOMAIN}lineraswap.fun/api/kline/ws`,
  'https://faucet.testnet-babbage.linera.net',
  `http://api.${domain.SUB_DOMAIN}rpc.respeer.ai/api/rpc`,
  `ws://api.${domain.SUB_DOMAIN}rpc.respeer.ai/api/rpc/ws`
]

export const APPLICATION_URLS = {
  BLOB_GATEWAY: formalizeSchema(URLS[0]),
  AMS: formalizeSchema(URLS[1]),
  PROXY: formalizeSchema(URLS[2]),
  SWAP: formalizeSchema(URLS[3]),
  PROXY_BASE: formalizeSchema(URLS[4]),
  PROXY_BASE_WS: formalizeSchema(URLS[5]),
  SWAP_BASE: formalizeSchema(URLS[6]),
  SWAP_BASE_WS: formalizeSchema(URLS[7]),
  KLINE_HTTP_URL: formalizeSchema(URLS[8]),
  KLINE_WS_URL: formalizeSchema(URLS[9]),
  FAUCET_URL: formalizeSchema(URLS[10]),
  RPC_URL: formalizeSchema(URLS[11]),
  RPC_WS_URL: formalizeSchema(URLS[12])
}

export const applicationId = (url: string) => {
  return url.split('/').at(-1)
}

export const chainId = (url: string) => {
  return url.split('/').at(-3)
}

export const LINERA_TICKER = 'TLINERA'
export const LINERA_NATIVE_ID = LINERA_TICKER
export const LINERA_LOGO =
  'https://avatars.githubusercontent.com/u/107513858?s=48&v=4'
