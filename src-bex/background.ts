import { bexBackground } from 'quasar/wrappers'
import * as process from 'process'
import { Buffer as BufferPolyfill } from 'buffer'
import { engine } from './engine'
import { BexBridge, BexPayload } from '@quasar/app-vite'
import { RpcRequest } from './middleware/types'
import { setupLineraSubscription } from './middleware/rpcimpl/lineragraphqldo'
import { sentinel, block } from './microchain'
import InstallationManager from './manager/installationmanager'

globalThis.Buffer = BufferPolyfill
globalThis.process = process

const installationManager = new InstallationManager()

export default bexBackground(
  (bridge: BexBridge /*, allActiveConnections */) => {
    engine.DataHandler.run(bridge)

    bridge.on('ping', (payload: BexPayload<RpcRequest, unknown>) => {
      void payload.respond('pong')
    })

    sentinel.Sentinel.run()
    block.BlockSigner.run()

    void setupLineraSubscription()
  }
)

installationManager.initializeOnInstalledListener()
