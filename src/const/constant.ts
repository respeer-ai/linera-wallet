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
  'http://api.blobgateway.com/api/blobs/chains/f7b00619e3b022d24dd802415e75d4182027d34ad04285a819176a4af3bead54/applications/d270c2e766f96752dd882d5da69d17ca055838f6a9d15b90938b64955c2324dc',
  'http://api.ams.respeer.ai/api/ams/chains/8e49e7d608df6d0a6852d17e12abc669f8d8d1d861bf200189785cb4e14231f3/applications/01df77a8a1e255aa0cf8f6c0119be8ec20116b01722cd2e2bc0dc8b7bd7aebee',
  'http://api.linerameme.fun/api/proxy/chains/ad61e8897c02fc7d723436cacebfd513a0388501d9af208e5b47401770b9ed6a/applications/4cfb88422fb5d102ffe2b8328314e216adceced5c1e76fdcfa84c3649eaf7f14',
  'http://api.lineraswap.fun/api/swap/chains/197ce4b80e33b6ea90192086e97dd536d663b3138c4504984dc9602cc4809f50/applications/fb77ce0f5a796e1a322e1215e250e1d547f966a414ec7eac522077f81cc24ed9',
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
