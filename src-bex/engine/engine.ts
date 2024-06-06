import { Runtime } from 'webextension-polyfill'
import type { JsonRpcRequest, Json, PendingJsonRpcResponse, JsonRpcParams } from '@metamask/utils'
import { JsonRpcEngine, JsonRpcEngineEndCallback, JsonRpcEngineNextCallback } from '@metamask/json-rpc-engine'
import { createEngineStream } from '@metamask/json-rpc-middleware-stream'
import PortStream from 'extension-port-stream'
import pump from 'pump'
import ObjectMultiplex from '@metamask/object-multiplex'
import * as constant from '../const'
import { Duplex } from 'readable-stream'
import { confirmation, rpc } from '../middleware'

export const connectRemote = (remotePort: Runtime.Port) => {
  connectExternal(remotePort)
}

export const connectExternal = (remotePort: Runtime.Port) => {
  const portStream = new PortStream(remotePort)
  const mux = new ObjectMultiplex()
  pump(portStream, mux, portStream, (err) => {
    console.log('CheCko background multiplex port', err)
  })
  const providerStream = mux.createStream(constant.PROVIDER)
  setupRpcEngine(providerStream)
}

const middlewareHandlers = [
  confirmation.confirmationHandler
]

const rpcExec = async (req: JsonRpcRequest<JsonRpcParams>, res: PendingJsonRpcResponse<Json>, next: JsonRpcEngineNextCallback, end: JsonRpcEngineEndCallback) => {
  for (const handler of middlewareHandlers) {
    const err = await handler(req)
    if (err !== undefined) {
      console.log('CheCko engine middleware', req.method, req.params, err)
      return end()
    }
  }
  const rc = rpc.rpcHandler(req)
  if (rc.err !== undefined) {
    console.log('CheCko engine rpc', req.method, req.params, rc.err)
    res.error = {
      code: -1,
      message: rc.err.message
    }
  } else {
    res.result = rc.res as Json
  }
  end()
}

export const setupRpcEngine = (mux: Duplex) => {
  const engine = new JsonRpcEngine()
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  engine.push(rpcExec)
  const providerStream = createEngineStream({ engine })
  pump(mux, providerStream, mux, (err) =>
    console.log('CheCko background multiplex provider', err)
  )
}
