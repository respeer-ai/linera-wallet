import * as constant from 'src/const'

export interface Setting {
  faucetSchema: constant.HTTPSchema
  faucetWSSchema: constant.WSSchema
  faucetHost: string
  faucetPort: number

  rpcSchema: constant.HTTPSchema
  rpcWSSchema: constant.WSSchema
  rpcHost: string
  rpcPort: number
}
