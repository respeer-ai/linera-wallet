import { bexBackground } from 'quasar/wrappers'
import * as process from 'process'
import { Buffer as BufferPolyfill } from 'buffer'
import { engine } from './engine'
import { BexBridge, BexPayload } from '@quasar/app-vite'
import { basebridge } from './event'
import type { JsonRpcParams, JsonRpcRequest, PendingJsonRpcResponse, Json } from '@metamask/utils'

globalThis.Buffer = BufferPolyfill
globalThis.process = process

export default bexBackground((bridge: BexBridge /*, allActiveConnections */) => {
  basebridge.EventBus.instance.setBridge(bridge)
  const _engine = new engine.Engine()
  const res = {} as PendingJsonRpcResponse<Json>
  bridge.on('data', (payload: BexPayload<JsonRpcRequest<JsonRpcParams>, unknown>) => {
    _engine.rpcExec(payload.data)
      .then((rc) => {
        res.result = rc as Json
        void payload.respond(res)
      })
      .catch((e: Error) => {
        res.error = {
          code: -1,
          message: e.message
        }
        void payload.respond(res)
      })
  })
})
