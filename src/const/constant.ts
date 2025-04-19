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
  'http://api.blobgateway.com/api/blobs/chains/66201b64d1b2b3e3bad971ea5ab08524739ce058df9996361e545de8820f53b7/applications/ae8ad6cf1446107bd996e55d6b2c3cff67376636407889d5c392d88d0348cb54',
  'http://api.ams.respeer.ai/api/ams/chains/0f01f62e5a1d1764baa378d7c115973b364a7474ca8dec5bede43016ccb48a73/applications/d1c7e6d51a26003ed047d841462d45ac89c59e6d90aa57d7971619dbadc24701',
  'http://api.linerameme.fun/api/proxy/chains/943a7f972e5dd64e126c8a22e69e8d1e492cd398b730db6ab46e780fe4f05c2a/applications/2926a3f53240bc99af0b4c469ce0275cd2d3c9d126e894badeaf996a9f19fb78',
  'http://api.lineraswap.fun/api/swap/chains/b47f1b5ae482460b585fa72c41b6b1ed46a1efe9292962ace8b675f55537d40f/applications/939e7f4bff8427039ff78a90d0ac9792a136fedc7a07aa7567641242257fd9f4',
  'http://api.linerameme.fun/api/proxy',
  'ws://api.linerameme.fun/api/proxy/ws',
  'http://api.lineraswap.fun/api/swap',
  'ws://api.lineraswap.fun/api/swap/ws',
  'http://api.lineraswap.fun/api/kline',
  'ws://api.lineraswap.fun/api/kline/ws',
  'http://api.faucet.respeer.ai/api/faucet',
  'http://api.rpc.respeer.ai/api/rpc'
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
  RPC_HOST: URLS[11]
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
