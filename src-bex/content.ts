/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks

import { bexContent } from 'quasar/wrappers'
import browser from 'webextension-polyfill'
import { WindowPostMessageStream } from '@metamask/post-message-stream'
import ObjMultiplex from '@metamask/object-multiplex'
import { initializeProvider } from '@metamask/providers'
import pump from 'pump'
import log from 'loglevel'
import { v4 as uuid } from 'uuid'
import * as process from 'process'

window.process = process

const CONTENT_SCRIPT = 'checko-contentscript'
const INPAGE = 'checko-inpage'

const setupPageStreams = () => {
  console.log('Setup page streams')

  // the transport-specific streams for communication between inpage and background
  const pageStream = new WindowPostMessageStream({
    name: CONTENT_SCRIPT,
    target: INPAGE
  })

  // create and connect channel muxers
  // so we can handle the channels individually
  const pageMux = new ObjMultiplex()
  pageMux.setMaxListeners(25)

  pump(pageMux, pageStream, pageMux, (err) =>
    console.log('MetaMask Inpage Multiplex', err)
  )

  // pageChannel = pageMux.createStream(PROVIDER)
}

log.setDefaultLevel(process.env.NODE_ENV === 'development' ? 'debug' : 'warn')

const setupProvider = () => {
  const metamaskStream = new WindowPostMessageStream({
    name: INPAGE,
    target: CONTENT_SCRIPT
  })

  const provider = initializeProvider({
    connectionStream: metamaskStream,
    logger: log,
    shouldShimWeb3: true,
    shouldSetOnWindow: false,
    providerInfo: {
      uuid: uuid(),
      name: 'CheCko Spring Hackathon',
      icon: 'data:image/png+xml;base64',
      rdns: 'ai.checko.respeer.main'
    }
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const _window = window as any
  _window.linera = provider
  window.dispatchEvent(new Event('linera#initialized'))
}

export default bexContent((bridge) => {
  setupPageStreams()
  setupProvider()

  browser.runtime.onMessage.addListener(msg => {
    console.log(msg)
    return bridge.send('buttonClicked')
  })
})
