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

const URLS = [
  'http://api.blobgateway.com/api/blobs/chains/5a23f69aed0af87da37e566efbd074af4ab0b95505a810b7362b888af4278da5/applications/f6ab6bc2ffea6ec7a88c34b3a2e285e9c39cfab299bf253e9e3b4947c3b4a56e',
  'http://api.ams.respeer.ai/api/ams/chains/84c470088d0e267ddfe250576fb01ca422b6dbcbea770ec39e9c52da1d763a26/applications/61036a73aa0293a2e8aa1347a25a99fa712b19c2920d5edae54b647099f4b065',
  'http://api.linerameme.fun/api/proxy/chains/3b4bb4a4fc839a2f602a59169f573ca95cb88ab42b75ae66044a01de90716ea9/applications/72f135fa19ef0283695978e41217be62e98bfb4c9317a65c4730d873c3d4248a',
  'http://api.lineraswap.fun/api/swap/chains/b5feaf9812353a4f27e26003421e6b64a721a159489d173ce0ae5774dac1d7a1/applications/fb35347084fa4f79ad4df9947b207e02aa8a73945848cc1a0ac4d4b46b11696b',
  'http://api.linerameme.fun/api/proxy',
  'ws://api.linerameme.fun/api/proxy/ws',
  'http://api.lineraswap.fun/api/swap',
  'ws://api.lineraswap.fun/api/swap/ws'
]

export const APPLICATION_URLS = {
  BLOB_GATEWAY: URLS[0],
  AMS: URLS[1],
  PROXY: URLS[2],
  SWAP: URLS[3],
  PROXY_BASE: URLS[4],
  PROXY_BASE_WS: URLS[5],
  SWAP_BASE: URLS[6],
  SWAP_BASE_WS: URLS[7]
}

export const formalizeSchema = (url: string) => {
  return url.replace(
    HTTPSchema.HTTP,
    process.env.NODE_ENV === 'production' ? HTTPSchema.HTTP : HTTPSchema.HTTP
  )
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

export const KLINE_WS_URL = 'ws://api.kline.lineraswap.fun/api/kline/ws'
export const KLINE_HTTP_URL = 'http://api.kline.lineraswap.fun/api/kline'
