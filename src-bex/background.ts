import { bexBackground } from 'quasar/wrappers'
import * as process from 'process'
import { Buffer as BufferPolyfill } from 'buffer'
import { engine } from './engine'
import { BexBridge } from '@quasar/app-vite'
import { setupLineraSubscription } from './middleware/rpcimpl/lineragraphqldo'
import { sentinel, block } from './microchain'
import InstallationManager from './manager/installationmanager'

globalThis.Buffer = BufferPolyfill
globalThis.process = process

const installationManager = new InstallationManager()
let keepaliveInterval

const keepalive = (bridge: BexBridge) => {
  if (keepaliveInterval !== undefined) return
  keepaliveInterval = setInterval(() => {
    for (const key of Object.keys(bridge.getEvents())) {
      if (key.startsWith('ping.') && key.endsWith('.result')) {
        bridge.removeAllListeners(key)
      }
    }
    void bridge.send('ping')
  }, 3000)
}

export default bexBackground(
  (bridge: BexBridge /* , allActiveConnections */) => {
    engine.DataHandler.run(bridge)

    keepalive(bridge)

    sentinel.Sentinel.run()
    block.BlockSigner.run()

    void setupLineraSubscription()
  }
)

installationManager.initializeOnInstalledListener()
