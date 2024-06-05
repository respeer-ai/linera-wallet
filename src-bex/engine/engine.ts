import { Runtime } from 'webextension-polyfill'
import { JsonRpcEngine } from '@metamask/json-rpc-engine'
import { createEngineStream } from '@metamask/json-rpc-middleware-stream'
import PortStream from 'extension-port-stream'
import pump from 'pump'
import ObjectMultiplex from '@metamask/object-multiplex'
import * as constant from '../const'
import { Duplex } from 'readable-stream'
import { confirmation } from '../middleware'

export const connectRemote = (remotePort: Runtime.Port) => {
  connectExternal(remotePort)
}

export const connectExternal = (remotePort: Runtime.Port) => {
  const portStream = new PortStream(remotePort)
  const mux = new ObjectMultiplex()
  pump(portStream, mux, portStream, (err) => {
    console.log('CheCko Background Multiplex', err)
  })
  const providerStream = mux.createStream(constant.PROVIDER)
  setupRpcEngine(providerStream)
}

const handlers = [
  confirmation.userConfirm
]

export const setupRpcEngine = (mux: Duplex) => {
  const engine = new JsonRpcEngine()
  handlers.forEach((handler) => {
    engine.push(handler)
  })
  const providerStream = createEngineStream({ engine })
  pump(mux, providerStream, mux, (err) =>
    console.log('CheCko Background Multiplex', err)
  )
}
