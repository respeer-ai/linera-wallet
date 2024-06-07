import type { JsonRpcRequest, JsonRpcParams } from '@metamask/utils'
import { confirmation, rpc, types } from '../middleware'

export class Engine {
  middlewareHandlers = [] as Array<types.MiddlewareImplHandler>

  constructor () {
    this.middlewareHandlers = [
      confirmation.confirmationHandler
    ]
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

  rpcExec (req: JsonRpcRequest<JsonRpcParams>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      this.rpcRecursiveExec(0, req, () => {
        rpc.rpcHandler(req)
          .then((res) => {
            resolve(res)
          })
          .catch((e: Error) => {
            reject(e)
          })
      }, (e) => {
        reject(e)
      })
    })
  }
}
