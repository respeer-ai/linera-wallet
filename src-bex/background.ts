import { bexBackground } from 'quasar/wrappers'
import browser from 'webextension-polyfill'
import * as process from 'process'
import { Buffer as BufferPolyfill } from 'buffer'
import { engine } from './engine'
import { BexBridge } from '@quasar/app-vite'
import { basebridge } from './event'

globalThis.Buffer = BufferPolyfill
globalThis.process = process

const initBackground = () => {
  const _engine = new engine.Engine()

  browser.runtime.onConnect.addListener((...args) => {
    // This is set in `setupController`, which is called as part of initialization
    _engine.connectRemote(...args)
  })
  browser.runtime.onConnectExternal.addListener((...args) => {
    // This is set in `setupController`, which is called as part of initialization
    _engine.connectExternal(...args)
  })
}

export default bexBackground((bridge: BexBridge /*, allActiveConnections */) => {
  basebridge.EventBus.instance.setBridge(bridge)
  initBackground()
})
