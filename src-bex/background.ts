import { bexBackground } from 'quasar/wrappers'
import * as process from 'process'
import { Buffer as BufferPolyfill } from 'buffer'
import { engine } from './engine'
import { BexBridge, BexConnection } from '@quasar/app-vite'
import { setupLineraSubscription } from './middleware/rpcimpl/lineragraphqldo'
import { sentinel, block } from './microchain'
import InstallationManager from './manager/installationmanager'
import browser from 'webextension-polyfill'
import {
  installRuntimeGuards,
  runSafely,
  runSafelyAsync
} from './runtime-guards'

globalThis.Buffer = BufferPolyfill
globalThis.process = process
installRuntimeGuards('bex-background')

const installationManager = new InstallationManager()
let keepaliveInterval

const isTabMetadataMessage = (
  value: unknown
): value is { type: 'checko:get-tab-metadata' } => {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as { type?: unknown }
  return candidate.type === 'checko:get-tab-metadata'
}

const keepalive = (
  bridge: BexBridge,
  allActiveConnections: {
    [connectionId: string]: {
      app?: BexConnection
      contentScript?: BexConnection
    }
  }
) => {
  if (keepaliveInterval !== undefined) return
  keepaliveInterval = setInterval(() => {
    Object.keys(allActiveConnections).forEach((key) => {
      const connection = allActiveConnections[key]
      if (connection.app?.connected) return
      if (connection.contentScript?.connected) return
      delete allActiveConnections[key]
    })
    for (const key of Object.keys(bridge.getEvents())) {
      if (key.startsWith('ping.') && key.endsWith('.result')) {
        bridge.removeAllListeners(key)
      }
    }
    void bridge.send('ping')
  }, 3000)
}

export default bexBackground(
  (
    bridge: BexBridge,
    allActiveConnections: {
      [connectionId: string]: {
        app?: BexConnection
        contentScript?: BexConnection
      }
    }
  ) => {
    keepalive(bridge, allActiveConnections)
    runSafely('bex-background:bridge-init', () => {
      engine.DataHandler.run(bridge)
    })
  }
)

runSafely('bex-background:install-listener', () => {
  installationManager.initializeOnInstalledListener()
})

browser.runtime.onMessage.addListener((message, sender) => {
  return runSafely('bex-background:on-message', () => {
    if (!isTabMetadataMessage(message)) {
      return undefined
    }

    const tab = sender.tab
    return Promise.resolve({
      url: tab?.url || '',
      title: tab?.title || '',
      favicon: tab?.favIconUrl || ''
    })
  })
})

runSafelyAsync('bex-background:sentinel', async () => {
  await sentinel.Sentinel.run()
})
runSafelyAsync('bex-background:subscription', () => {
  setupLineraSubscription()
})
runSafely('bex-background:block-signer', () => {
  block.BlockSigner.run()
})
