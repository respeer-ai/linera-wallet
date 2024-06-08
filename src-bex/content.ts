// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks

import { bexContent } from 'quasar/wrappers'
import { WindowPostMessageStream } from '@metamask/post-message-stream'
import ObjMultiplex from '@metamask/object-multiplex'
import pump from 'pump'
import * as process from 'process'
import * as constant from './const'
import { createEngineStream } from '@metamask/json-rpc-middleware-stream'
import { Duplex } from 'readable-stream'
import { Buffer as BufferPolyfill } from 'buffer'
import { BexBridge, BexPayload } from '@quasar/app-vite'
import { JsonRpcEngine } from '@metamask/json-rpc-engine'
import type { Json, PendingJsonRpcResponse } from '@metamask/utils'

window.Buffer = BufferPolyfill
window.process = process

const setupPageStream = () => {
  // the transport-specific streams for communication between inpage and background
  const pageStream = new WindowPostMessageStream({
    name: constant.CONTENT_SCRIPT,
    target: constant.INPAGE
  })

  // create and connect channel muxers
  // so we can handle the channels individually
  const pageMux = new ObjMultiplex()
  pageMux.setMaxListeners(25)

  pump(pageMux, pageStream, pageMux, (err) =>
    console.log('CheCko inpage multiplex', err)
  )

  return pageMux.createStream(constant.PROVIDER)
}

const setupRpcEngine = (bridge: BexBridge, mux: Duplex) => {
  const engine = new JsonRpcEngine()
  engine.push((req, res, _next, end) => {
    bridge.send('data', req)
      .then((payload: BexPayload<PendingJsonRpcResponse<Json>, undefined>) => {
        if (!payload.data.result && !payload.data.error) {
          console.log('Invalid rpc response')
        }
        if (payload.data.error) {
          console.log('CheCko inpage error', payload.data.error)
        }
        res.result = payload.data.result
        res.error = payload.data.error
        end()
      })
      .catch((e: Error) => {
        console.log('CheCko inpage dispatcher', req.method, req.params, e)
        res.error = {
          code: -2,
          message: e.message
        }
        end()
      })
  })
  const providerStream = createEngineStream({ engine })
  pump(mux, providerStream, mux, (err) =>
    console.log('CheCko background multiplex provider', err)
  )
}

export default bexContent((bridge: BexBridge) => {
  setupRpcEngine(bridge, setupPageStream())
})
