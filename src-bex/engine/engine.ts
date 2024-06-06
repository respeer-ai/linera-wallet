import { Runtime } from 'webextension-polyfill'
import type { JsonRpcRequest, Json, PendingJsonRpcResponse, JsonRpcParams } from '@metamask/utils'
import { JsonRpcEngine, JsonRpcEngineEndCallback } from '@metamask/json-rpc-engine'
import { createEngineStream } from '@metamask/json-rpc-middleware-stream'
import PortStream from 'extension-port-stream'
import pump from 'pump'
import ObjectMultiplex from '@metamask/object-multiplex'
import * as constant from '../const'
import { Duplex } from 'readable-stream'
import { confirmation, rpc, types } from '../middleware'

export class Engine {
  middlewareHandlers = [] as Array<types.MiddlewareImplHandler>

  constructor () {
    this.middlewareHandlers = [
      confirmation.confirmationHandler
    ]
  }

  connectRemote (remotePort: Runtime.Port) {
    this.connectExternal(remotePort)
  }

  connectExternal (remotePort: Runtime.Port) {
    const portStream = new PortStream(remotePort)
    const mux = new ObjectMultiplex()
    pump(portStream, mux, portStream, (err) => {
      console.log('CheCko background multiplex port', err)
    })
    const providerStream = mux.createStream(constant.PROVIDER)
    this.setupRpcEngine(providerStream)
  }

  async rpcExec (req: JsonRpcRequest<JsonRpcParams>, res: PendingJsonRpcResponse<Json>, end: JsonRpcEngineEndCallback) {
    for (const handler of this.middlewareHandlers) {
      const err = await handler(req)
      if (err !== undefined) {
        console.log('CheCko engine middleware', req.method, req.params, err)
        return end()
      }
    }
    const rc = await rpc.rpcHandler(req)
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

  setupRpcEngine (mux: Duplex) {
    const engine = new JsonRpcEngine()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    engine.push(async (req, res, next, end) => {
      await this.rpcExec(req, res, end)
    })
    const providerStream = createEngineStream({ engine })
    pump(mux, providerStream, mux, (err) =>
      console.log('CheCko background multiplex provider', err)
    )
  }
}
