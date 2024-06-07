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

  rpcRecursiveExec (middlewareIndex: number, req: JsonRpcRequest<JsonRpcParams>, done: () => void, error: (e: Error) => void) {
    if (this.middlewareHandlers.length <= middlewareIndex) {
      return done()
    }
    this.middlewareHandlers[middlewareIndex](req).then(() => {
      this.rpcRecursiveExec(middlewareIndex + 1, req, done, error)
    }).catch((e: Error) => {
      error(e)
    })
  }

  rpcExec (req: JsonRpcRequest<JsonRpcParams>, res: PendingJsonRpcResponse<Json>, end: JsonRpcEngineEndCallback) {
    this.rpcRecursiveExec(0, req, () => {
      rpc.rpcHandler(req)
        .then((rc) => {
          res.result = rc as Json
          end()
        })
        .catch((e: Error) => {
          console.log('CheCko engine rpc', req.method, req.params, e)
          res.error = {
            code: -1,
            message: e.message
          }
          end()
        })
    }, (e) => {
      console.log('CheCko engine middleware', req.method, req.params, e)
      res.error = {
        code: -2,
        message: e.message
      }
      end()
    })
  }

  setupRpcEngine (mux: Duplex) {
    const engine = new JsonRpcEngine()
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    engine.push((req, res, next, end) => {
      this.rpcExec(req, res, end)
    })
    const providerStream = createEngineStream({ engine })
    pump(mux, providerStream, mux, (err) =>
      console.log('CheCko background multiplex provider', err)
    )
  }
}
