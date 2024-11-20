import { bexBackground } from 'quasar/wrappers'
import * as process from 'process'
import { Buffer as BufferPolyfill } from 'buffer'
import { engine } from './engine'
import { BexBridge } from '@quasar/app-vite'
import { setupLineraSubscription } from './middleware/rpcimpl/lineragraphqldo'
import { sentinel, block } from './microchain'
import InstallationManager from './manager/installationmanager'
import { EventEmitter } from 'events'

globalThis.Buffer = BufferPolyfill
globalThis.process = process

const installationManager = new InstallationManager()

const keepalive = (bridge: BexBridge) => {
  // We cannot use bridge to listen here due to bridge only respond to connections from application
  const emitter = bridge as EventEmitter

  emitter.on('ping', () => {
    // We cannot send to bridge here due to quasar only send to app connections
    bridge.emit('pong')
  })

  emitter.on('pong', () => {
    // DO NOTHING: just let it live
  })

  setInterval(() => {
    // We cannot send to bridge here due to quasar only send to app connections
    bridge.emit('ping')
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
