/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { bexBackground } from 'quasar/wrappers'
import browser from 'webextension-polyfill'
import * as process from 'process'
import { Buffer as BufferPolyfill } from 'buffer'
import { engine } from './engine'

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
    engine.connectRemote(...args)
  })
  browser.runtime.onConnectExternal.addListener((...args) => {
    // This is set in `setupController`, which is called as part of initialization
    engine.connectExternal(...args)
  })
}

export default bexBackground((/* bridge, allActiveConnections */) => {
  initBackground()
})
