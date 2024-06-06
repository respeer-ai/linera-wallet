import { bexBackground } from 'quasar/wrappers'
import browser from 'webextension-polyfill'
import * as process from 'process'
import { Buffer as BufferPolyfill } from 'buffer'
import { engine } from './engine'

globalThis.Buffer = BufferPolyfill
globalThis.process = process

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

export default bexBackground((bridge /*, allActiveConnections */) => {
  globalThis.bridge = bridge
  initBackground()
})
