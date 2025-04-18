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
  'http://api.blobgateway.com/api/blobs/chains/f7bcbdaa3453198a75533bff44f51b5bae4821119669e45a0593b738b2de2559/applications/70d3bd3d9d38feadff94b5da5cdfb245d20d2131df387614a63610edf4d9b632',
  'http://api.ams.respeer.ai/api/ams/chains/d49a79859385c2e55186074c761e6fcb3906222e300cb9df0145d3bbd381809a/applications/75d247338aff132f2ed59ffd131e8bca742fec60e34a397e2392e167bb0d8822',
  'http://api.linerameme.fun/api/proxy/chains/f4bcf8d9f20277cf309b00d3ef1c449a6d982416aa1051610c2b7289d4a66030/applications/ee13c64a76278ae60b060477cd057427aaf2367e73cb99c25727ebfd9e8c7195',
  'http://api.lineraswap.fun/api/swap/chains/2376f0bc4bd2240c9b655a5fa07f21645c397f904b6820fe178f7463be7c1a25/applications/6111a63d45ee1c0827e22dc3c7807456f882013f11af3ed6d8a1debb413db4f7',
  'http://api.linerameme.fun/api/proxy',
  'ws://api.linerameme.fun/api/proxy/ws',
  'http://api.lineraswap.fun/api/swap',
  'ws://api.lineraswap.fun/api/swap/ws',
  'http://api.lineraswap.fun/api/kline',
  'ws://api.lineraswap.fun/api/kline/ws',
  'http://api.faucet.respeer.ai/api/faucet',
  'api.rpc.respeer.ai'
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
