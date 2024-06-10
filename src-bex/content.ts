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
import { JsonRpcEngine, JsonRpcEngineEndCallback, JsonRpcEngineNextCallback } from '@metamask/json-rpc-engine'
import type { Json, PendingJsonRpcResponse, JsonRpcParams, JsonRpcRequest } from '@metamask/utils'
import { RpcMethod, RpcRequest } from './middleware/types'
import * as subscription from './middleware/subscription'

window.Buffer = BufferPolyfill
window.process = process

const _subscription = new subscription.Subscription()

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

const rpcHandler = (
  bridge: BexBridge,
  req: JsonRpcRequest<JsonRpcParams>,
  res: PendingJsonRpcResponse<Json>,
  end: JsonRpcEngineEndCallback
) => {
  const favicon = window.document.querySelector('link[rel=icon]') ||
                  window.document.querySelector('link[rel="shortcut icon"]')
  const rpcRequest = {
    origin: window.location.origin,
    name: window.document.title,
    favicon: (favicon as HTMLLinkElement)?.href || 'favicon.ico',
    request: req
  } as RpcRequest
  bridge.send('data', rpcRequest)
    .then((payload: BexPayload<PendingJsonRpcResponse<Json>, undefined>) => {
      if (!payload.data.result && !payload.data.error) {
        console.log('Invalid rpc response')
      }
      if (payload.data.error) {
        console.log('CheCko inpage error', req, payload.data.error)
      }
      res.result = payload.data.result
      res.error = payload.data.error
      end()
    })
    .catch((e: Error) => {
      console.log('CheCko inpage dispatcher', req, e)
      res.error = {
        code: -2,
        message: e.message
      }
      end()
    })
}

const subscriptionHandler = (
  bridge: BexBridge,
  req: JsonRpcRequest<JsonRpcParams>,
  res: PendingJsonRpcResponse<Json>,
  next: JsonRpcEngineNextCallback,
  end: JsonRpcEngineEndCallback,
  notifier: (subscriptionId: string, payload: unknown) => void
) => {
  switch (req.method) {
    case RpcMethod.LINERA_SUBSCRIBE:
    {
      let subscriptionId = ''
      const handler = (payload: BexPayload<unknown, unknown>) => {
        notifier(subscriptionId, payload.data)
      }
      subscriptionId = _subscription.subscribe(req.params as string[], handler)
      bridge.on('linera_subscription', handler)
      res.result = subscriptionId
      return end()
    }
    case RpcMethod.LINERA_UNSUBSCRIBE:
    {
      const subscriptionId = (req.params?.length ? (req.params as Json[])[0] : undefined) as string
      if (!subscriptionId) {
        res.error = {
          code: -3,
          message: 'Invalid subscription id'
        }
        return end()
      }
      const handler = _subscription.unsubscribe(subscriptionId)
      if (!handler) {
        res.error = {
          code: -4,
          message: 'Already unsubscribed'
        }
        return end()
      }
      bridge.off('linera_subscription', handler)
      return
    }
  }
  next()
}

const setupRpcEngine = (bridge: BexBridge, mux: Duplex) => {
  const engine = new JsonRpcEngine()
  engine.push((req, res, next, end) => {
    subscriptionHandler(bridge, req, res, next, end, (subscriptionId: string, payload: unknown) => {
      engine.emit('notification', {
        jsonrpc: '2.0',
        method: 'eth_subscription', // Here it must be eth_subscription to compatibility for web3.js
        params: {
          subscription: subscriptionId,
          result: payload
        }
      })
    })
  })
  engine.push((req, res, _next, end) => {
    rpcHandler(bridge, req, res, end)
  })
  const providerStream = createEngineStream({ engine })
  pump(mux, providerStream, mux, (err) =>
    console.log('CheCko background multiplex provider', err)
  )
}

export default bexContent((bridge: BexBridge) => {
  setupRpcEngine(bridge, setupPageStream())
})
