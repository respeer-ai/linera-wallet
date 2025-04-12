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
  'http://api.blobgateway.com/api/blobs/chains/93ccfbf1de6b0bd3074bce9238f18d7e03f512310459052f3946b94427e75dd0/applications/08256ae7a5f33432a4a250a613fb2566570e1929c802c988c0d7c3b91977372f',
  'http://api.ams.respeer.ai/api/ams/chains/e4e3ac0a7ec88cb91235d97b215442d1cdb673be06f1aec4a1d994b9b18c8762/applications/a881fd10e3d52637697841322e5248bc878080daeda8de5a1c911ba88fcbffe7',
  'http://api.linerameme.fun/api/proxy/chains/7fd6d38952f2cc45c6d8bc5adbc45f1a38f63103bff078edb3cc70744d025a13/applications/5e5892dd50f322561546041535a0c1b16e2aee84d6d3cc6bb35263204d49ff42',
  'http://api.lineraswap.fun/api/swap/chains/4506bfce9ef838bcc72fa44475f8e2e98da5c0fe3c41d04c411e5c0d6bbe5988/applications/52b540873853cfa4b10ec60b0341bb0b8b9e25f30f44e1ecd2f9d8ba9df17f7a',
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
