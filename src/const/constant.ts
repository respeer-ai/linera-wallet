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
  'http://api.blobgateway.com/api/blobs/chains/1e32ddfc28f1210e90332bb0ea34b7f2b02e1586b913f819d25d06ba08a48429/applications/45113f9c7e08ad41d57721920d1f1dd8c3da11583d71427ad3734b6a9f854950',
  'http://api.ams.respeer.ai/api/ams/chains/5044a85575e26917aa3b75f06e98b6e5f9fe1935d9f8cd426e123bfd998c37eb/applications/e35eebfc412cf60801f54dadc27b20210c3dcaa561b325b77faf4755eed5be10',
  'http://api.linerameme.fun/api/proxy/chains/ca93999b3768d91b4bf36a753451482ecb65c4f3f777978de1fb32161c84b329/applications/189d6de18ba4d3c2623497d704cab088279ee93a9cc6f870e44dc5b878e95fe8',
  'http://api.lineraswap.fun/api/swap/chains/cf3dc43fbe798f569fe7622d2fe74c711f9de5e4050253d51135c0c99d284dbb/applications/2652dc72706766da9f735dae139466e2f237b5718f5dd8962a995204aef686d0',
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
