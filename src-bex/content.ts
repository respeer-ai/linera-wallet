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
import {
  JsonRpcEngine,
  JsonRpcEngineEndCallback,
  JsonRpcEngineNextCallback
} from '@metamask/json-rpc-engine'
import type {
  Json,
  PendingJsonRpcResponse,
  JsonRpcParams,
  JsonRpcRequest
} from '@metamask/utils'
import { RpcMethod, RpcRequest } from './middleware/types'
import { subscription } from './content/subscription'
import { subscription as bgSubscription } from './subscription'
import {
  installRuntimeGuards,
  logRuntimeWarning,
  runSafely
} from './runtime-guards'

window.Buffer = BufferPolyfill
window.process = process
installRuntimeGuards('bex-content')

interface PageMetadata {
  origin: string
  name: string
  favicon: string
}

interface TabMetadataResponse {
  url?: string
  title?: string
  favicon?: string
}

const pageMetadata: PageMetadata = {
  origin: '',
  name: '',
  favicon: ''
}

const normalizeUrl = (value?: unknown): string | undefined => {
  if (typeof value !== 'string' || !value) return undefined
  try {
    return new URL(value, window.location.href).href
  } catch {
    return undefined
  }
}

const normalizedOrigin = () => {
  if (window.location.origin && window.location.origin !== 'null') {
    return window.location.origin
  }
  return `${window.location.protocol}//${window.location.host}`
}

const pageTitle = () => {
  const title = window.document.title?.trim()
  if (title?.length) return title
  return window.location.hostname || normalizedOrigin()
}

const readStringProperty = (value: unknown, key: string): string | null => {
  if (typeof value !== 'object' || value === null) {
    return null
  }

  const candidate = value as Record<string, unknown>
  const property = candidate[key]
  return typeof property === 'string' ? property : null
}

const normalizeMaybeUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return normalizeUrl(null)
  }

  const urlValue = `${value}`
  return normalizeUrl(urlValue)
}

const pageFavicon = () => {
  const headHtml = window.document.head?.innerHTML || ''
  const iconPattern =
    /<link[^>]*rel=["'][^"']*\bicon\b[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i
  const iconReversePattern =
    /<link[^>]*href=["']([^"']+)["'][^>]*rel=["'][^"']*\bicon\b[^"']*["'][^>]*>/i
  const ogImagePattern =
    /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["'][^>]*>/i
  const ogImageReversePattern =
    /<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["'][^>]*>/i

  const iconHref = normalizeMaybeUrl(headHtml.match(iconPattern)?.[1])
  if (iconHref) return iconHref

  const iconReverseHref = normalizeMaybeUrl(
    headHtml.match(iconReversePattern)?.[1]
  )
  if (iconReverseHref) return iconReverseHref

  const ogImageHref = normalizeMaybeUrl(headHtml.match(ogImagePattern)?.[1])
  if (ogImageHref) return ogImageHref

  const ogImageReverseHref = normalizeMaybeUrl(
    headHtml.match(ogImageReversePattern)?.[1]
  )
  if (ogImageReverseHref) return ogImageReverseHref

  return normalizeUrl('/favicon.ico') || ''
}

const requestTabMetadata = async () => {
  try {
    const response: unknown = await chrome.runtime.sendMessage({
      type: 'checko:get-tab-metadata'
    })
    const tabMetadata = {
      url: readStringProperty(response, 'url') || undefined,
      title: readStringProperty(response, 'title') || undefined,
      favicon: readStringProperty(response, 'favicon') || undefined
    } as TabMetadataResponse

    if (tabMetadata.url) {
      try {
        const url = new URL(tabMetadata.url)
        pageMetadata.origin =
          url.origin !== 'null' ? url.origin : `${url.protocol}//${url.host}`
      } catch {
        // Ignore malformed tab URL and keep DOM-derived origin.
      }
    }

    if (tabMetadata.title?.trim()) {
      pageMetadata.name = tabMetadata.title.trim()
    }

    const favicon = normalizeUrl(tabMetadata.favicon)
    if (favicon) {
      pageMetadata.favicon = favicon
    }
  } catch {
    // Ignore runtime metadata failures and keep DOM-derived metadata.
  }
}

const refreshPageMetadata = () => {
  const origin = normalizedOrigin()
  const name = pageTitle()
  const favicon = pageFavicon()

  if (origin) {
    pageMetadata.origin = origin
  }
  if (name) {
    pageMetadata.name = name
  }
  if (favicon) {
    pageMetadata.favicon = favicon
  }
}

const setupMetadataTracking = () => {
  refreshPageMetadata()
  void requestTabMetadata()

  window.addEventListener('load', () => {
    refreshPageMetadata()
    void requestTabMetadata()
  })

  document.addEventListener('readystatechange', () => {
    refreshPageMetadata()
    void requestTabMetadata()
  })

  const observer = new MutationObserver(() => {
    refreshPageMetadata()
  })

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
    attributes: true,
    attributeFilter: ['href', 'content', 'rel']
  })
}

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
    logRuntimeWarning('bex-content:inpage-multiplex', err)
  )

  return pageMux.createStream(constant.PROVIDER)
}

const req2RpcRequest = (req: JsonRpcRequest<JsonRpcParams>) => {
  refreshPageMetadata()
  return {
    origin: pageMetadata.origin || normalizedOrigin(),
    name: pageMetadata.name || pageTitle(),
    favicon: pageMetadata.favicon || pageFavicon(),
    request: req
  } as RpcRequest
}

const rpcHandler = (
  bridge: BexBridge,
  req: JsonRpcRequest<JsonRpcParams>,
  res: PendingJsonRpcResponse<Json>,
  end: JsonRpcEngineEndCallback
) => {
  const rpcRequest = req2RpcRequest(req)
  bridge
    .send('data', rpcRequest)
    .then((payload: BexPayload<PendingJsonRpcResponse<Json>, undefined>) => {
      if (!payload.data.result && !payload.data.error) {
        console.log('Invalid rpc response', payload.data)
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
        message: e.message || JSON.stringify(e)
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
  const rpcRequest = req2RpcRequest(req)
  switch (req.method) {
    case RpcMethod.LINERA_SUBSCRIBE: {
      bridge
        .send('data', rpcRequest)
        .then(
          (payload: BexPayload<PendingJsonRpcResponse<string>, undefined>) => {
            if (!payload.data.result && !payload.data.error) {
              console.log('Invalid rpc response', payload.data)
            }
            if (payload.data.error) {
              console.log('CheCko inpage error', req, payload.data.error)
              res.error = payload.data.error
            } else {
              const subscriptionId = payload.data.result as string
              const handler = (
                payload: BexPayload<bgSubscription.SubscriptionPayload, unknown>
              ) => {
                notifier(subscriptionId, payload.data.payload)
              }
              subscription.Subscription.subscribe(subscriptionId, handler)
              bridge.on('linera_subscription', handler)

              res.result = subscriptionId
            }
            end()
          }
        )
        .catch((e: Error) => {
          console.log('CheCko inpage subscription', req, e)
          res.error = {
            code: -2,
            message: e.message || JSON.stringify(e)
          }
          console.log('Fail subscription', e)
        })
      break
    }
    case RpcMethod.LINERA_UNSUBSCRIBE: {
      bridge
        .send('data', rpcRequest)
        .then(
          (payload: BexPayload<PendingJsonRpcResponse<string>, undefined>) => {
            const subscriptionId = payload.data.result as string
            const handler =
              subscription.Subscription.unsubscribe(subscriptionId)
            if (!handler) {
              res.error = {
                code: -4,
                message: 'Already unsubscribed'
              }
              return end()
            }
            bridge.off('linera_subscription', handler)
            res.result = subscriptionId
            end()
          }
        )
        .catch((e: Error) => {
          console.log('CheCko inpage unsubscription', req, e)
          res.error = {
            code: -2,
            message: e.message || JSON.stringify(e)
          }
          console.log('Fail subscription', e)
        })
      break
    }
    default:
      next()
  }
}

const setupRpcEngine = (bridge: BexBridge, mux: Duplex) => {
  const engine = new JsonRpcEngine()
  engine.push((req, res, next, end) => {
    subscriptionHandler(
      bridge,
      req,
      res,
      next,
      end,
      (subscriptionId: string, payload: unknown) => {
        engine.emit('notification', {
          jsonrpc: '2.0',
          method: 'eth_subscription', // Here it must be eth_subscription to compatibility for web3.js
          params: {
            subscription: subscriptionId,
            result: payload
          }
        })
      }
    )
  })
  engine.push((req, res, _next, end) => {
    rpcHandler(bridge, req, res, end)
  })
  const providerStream = createEngineStream({ engine })
  pump(mux, providerStream, mux, (err) =>
    logRuntimeWarning('bex-content:background-multiplex', err)
  )
}

export default bexContent((bridge: BexBridge) => {
  runSafely('bex-content:init', () => {
    setupMetadataTracking()
    setupRpcEngine(bridge, setupPageStream())
  })
})
