// const faucetSchema = 'https'
// const faucetHost = 'faucet.devnet.linera.net'
// const faucetPort = 443

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

export const toUrl = (schema: HTTPSchema | WSSchema, host: string, port: number) => {
  return schema + '://' + host + ':' + port.toString()
}
