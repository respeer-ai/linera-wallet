import { bexBackground } from 'quasar/wrappers'
import * as process from 'process'
import { Buffer as BufferPolyfill } from 'buffer'
import { engine } from './engine'
import { BexBridge, BexPayload } from '@quasar/app-vite'
import { basebridge } from './event'
import type { PendingJsonRpcResponse, Json } from '@metamask/utils'
import { RpcRequest } from './middleware/types'
import { setupLineraSubscription } from './middleware/rpcimpl/lineragraphqldo'
import { sentinel } from './microchain'
import InstallationManager from './manager/installationmanager'

globalThis.Buffer = BufferPolyfill
globalThis.process = process

const installationManager = new InstallationManager()

export default bexBackground(
  (bridge: BexBridge /*, allActiveConnections */) => {
    basebridge.EventBus.instance.setBridge(bridge)

    const _engine = new engine.Engine()
    bridge.on('data', (payload: BexPayload<RpcRequest, unknown>) => {
      const res = {} as PendingJsonRpcResponse<Json>
      _engine
        .rpcExec(payload.data)
        .then((rc) => {
          res.result = rc as Json
          void payload.respond(res)
        })
        .catch((e: Error) => {
          res.error = {
            code: -1,
            message: e.message
          }
          void payload.respond(res)
        })
    })

    sentinel.Sentinel.run()
    void setupLineraSubscription()
  }
)

installationManager.initializeOnInstalledListener()
