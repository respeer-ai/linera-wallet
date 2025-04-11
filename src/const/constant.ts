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
  'http://api.blobgateway.com/api/blobs/chains/dd8833cd5e301b5961dfb1d4c1621ae4d11e9556221b363b7a0ca90bd2bde4da/applications/38e2f90e430a4f4ecdc25f08ae1378a80f6f2fabd88a686629d4ac70b2e94b40',
  'http://api.ams.respeer.ai/api/ams/chains/60f33ca5fea0e85ac4d57371c57d3169e0f20f5c2618a736ae1dc57d376a6c44/applications/1c45c53bb33652f61f2e2646444cceb49693d91afe2bd23bc3fd3ce9d3eb4dd5',
  'http://api.linerameme.fun/api/proxy/chains/03ffc5588f701645b242018486bd34dec0036cd0a783fedbe096de401d7de03e/applications/0af361dbdad5d2165f753f16cc5d55f9b4b1da3c143d68cee5d34b6e851014ba',
  'http://api.lineraswap.fun/api/swap/chains/8116058b3f47a4c1731738d7229d0b71ba9d0c28a47b605105ebaba00f49d012/applications/ae8fc284657ad6fd3b5c2d00d65cb4340bf32e790a2147ba32ada380457fa1a8',
  'http://api.linerameme.fun/api/proxy',
  'http://api.lineraswap.fun/api/swap'
]

export const APPLICATION_URLS = {
  BLOB_GATEWAY: URLS[0],
  AMS: URLS[1],
  PROXY: URLS[2],
  SWAP: URLS[3],
  PROXY_BASE: URLS[4],
  SWAP_BASE: URLS[5]
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
