import { confirmation, rpc, types } from '../middleware'
import { RpcMethod, RpcMethods, RpcRequest } from '../middleware/types'

export class Engine {
  middlewareHandlers = [] as Array<types.MiddlewareImplHandler>

  constructor () {
    this.middlewareHandlers = [
      confirmation.confirmationHandler
    ]
  }

  rpcRecursiveExec (middlewareIndex: number, req: RpcRequest, done: (message: string | undefined) => void, error: (e: Error) => void, message: string | undefined) {
    if (this.middlewareHandlers.length <= middlewareIndex) {
      return done(message)
    }
    this.middlewareHandlers[middlewareIndex](req).then((message: string | undefined) => {
      this.rpcRecursiveExec(middlewareIndex + 1, req, done, error, message)
    }).catch((e: Error) => {
      error(e)
    })
  }

  rpcExec (req: RpcRequest): Promise<unknown> {
    if (!RpcMethods.includes(req.request.method as RpcMethod)) {
      return Promise.reject(new Error('Invalid rpc method'))
    }
    return new Promise((resolve, reject) => {
      this.rpcRecursiveExec(0, req, (message: string | undefined) => {
        switch (req.request.method) {
          case RpcMethod.ETH_SIGN:
            resolve(message)
            return
        }
        rpc.rpcHandler(req)
          .then((res) => {
            resolve(res)
          })
          .catch((e: Error) => {
            reject(e)
          })
      }, (e) => {
        reject(e)
      }, undefined)
    })
  }
}
