// Hooks added here have a bridge allowing communication between the Web Page and the BEX Content Script.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/dom-hooks
import { bexDom } from 'quasar/wrappers'
import log from 'loglevel'
import { v4 as uuid } from 'uuid'
import { initializeProvider } from '@metamask/providers'
import { WindowPostMessageStream } from '@metamask/post-message-stream'
import * as process from 'process'
import * as constant from './const'

window.process = process

log.setDefaultLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'warn')

const setupProvider = () => {
  const metamaskStream = new WindowPostMessageStream({
    name: constant.INPAGE,
    target: constant.CONTENT_SCRIPT
  })

  const provider = initializeProvider({
    connectionStream: metamaskStream,
    jsonRpcStreamName: constant.PROVIDER,
    logger: log,
    shouldShimWeb3: true,
    shouldSetOnWindow: false,
    providerInfo: {
      uuid: uuid(),
      name: 'CheCko Spring Hackathon',
      icon: 'data:image/png+xml;base64',
      rdns: 'ai.respeer.checko.main'
    }
  })
  window.linera = provider
  window.dispatchEvent(new Event('linera#initialized'))
}

export default bexDom((/* bridge */) => {
  setupProvider()
})
