/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { bexBackground } from 'quasar/wrappers'
import browser, { Runtime } from 'webextension-polyfill'
import { JsonRpcEngine } from '@metamask/json-rpc-engine'
import { createEngineStream } from '@metamask/json-rpc-middleware-stream'
import PortStream from 'extension-port-stream'
import pump from 'pump'
import * as process from 'process'
import { Buffer as BufferPolyfill } from 'buffer'
import ObjectMultiplex from '@metamask/object-multiplex'
import * as constant from './const'
import { Duplex } from 'readable-stream'

globalThis.Buffer = BufferPolyfill
globalThis.process = process

declare module '@quasar/app-vite' {
  interface BexEventMap {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    log: [{ message: string, data?: any[] }, never]
    getTime: [never, number]

    'storage.get': [{ key: string | null }, any]
    'storage.set': [{ key: string, value: any }, any]
    'storage.remove': [{ key: string }, any]
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
}

const initBackground = () => {
  console.log('Initialize CheCko background')
  browser.runtime.onConnect.addListener((...args) => {
    // This is set in `setupController`, which is called as part of initialization
    connectRemote(...args)
  })
  browser.runtime.onConnectExternal.addListener((...args) => {
    // This is set in `setupController`, which is called as part of initialization
    connectExternal(...args)
  })
}

const connectRemote = (remotePort: Runtime.Port) => {
  connectExternal(remotePort)
}

const connectExternal = (remotePort: Runtime.Port) => {
  const portStream = new PortStream(remotePort)
  const mux = new ObjectMultiplex()
  pump(portStream, mux, portStream, (err) => {
    console.log('CheCko Background Multiplex', err)
  })
  const providerStream = mux.createStream(constant.PROVIDER)
  setupRpcEngine(providerStream)
}

const setupRpcEngine = (mux: Duplex) => {
  const engine = new JsonRpcEngine()
  engine.push((req, res, next, end) => {
    res.result = req
    end()
  })
  const providerStream = createEngineStream({ engine })
  pump(mux, providerStream, mux, (err) =>
    console.log('CheCko Background Multiplex', err)
  )
}

export default bexBackground((/* bridge, allActiveConnections */) => {
  initBackground()
})
