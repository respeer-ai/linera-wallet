// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks

import { bexContent } from 'quasar/wrappers'
import browser, { Runtime } from 'webextension-polyfill'
import { WindowPostMessageStream } from '@metamask/post-message-stream'
import ObjMultiplex from '@metamask/object-multiplex'
import pump from 'pump'
import * as process from 'process'
import * as constant from './const'
import PortStream from 'extension-port-stream'
import { Duplex } from 'readable-stream'
import { Buffer as BufferPolyfill } from 'buffer'

window.Buffer = BufferPolyfill
window.process = process

let pageChannel: Duplex,
  extensionMux: ObjMultiplex,
  extensionChannel: Duplex,
  extensionPort: Runtime.Port,
  extensionStream: PortStream,
  pageMux: ObjMultiplex,
  pageStream: WindowPostMessageStream

const setupPageStreams = () => {
  // the transport-specific streams for communication between inpage and background
  pageStream = new WindowPostMessageStream({
    name: constant.CONTENT_SCRIPT,
    target: constant.INPAGE
  })

  // create and connect channel muxers
  // so we can handle the channels individually
  pageMux = new ObjMultiplex()
  pageMux.setMaxListeners(25)

  pump(pageMux, pageStream, pageMux, (err) =>
    console.log('CheCko Inpage Multiplex', err)
  )

  pageChannel = pageMux.createStream(constant.PROVIDER)
}

const setupExtensionStreams = () => {
  extensionPort = browser.runtime.connect({ name: constant.CONTENT_SCRIPT })
  extensionStream = new PortStream(extensionPort)

  // create and connect channel muxers
  // so we can handle the channels individually
  extensionMux = new ObjMultiplex()
  extensionMux.setMaxListeners(25)

  pump(extensionMux, extensionStream, extensionMux, (e) => {
    console.log('CheCko content multiplex extension', e)
  })

  // forward communication across inpage-background for these channels only
  extensionChannel = extensionMux.createStream(constant.PROVIDER)
  pump(pageChannel, extensionChannel, pageChannel, (error) =>
    console.debug(
      `CheCko: Muxed traffic for channel "${constant.PROVIDER}" failed.`,
      error
    )
  )

  // eslint-disable-next-line no-use-before-define
  extensionPort.onDisconnect.addListener((port) => {
    console.log('CheCko content multiplex extension disconnected', port)
  })
}

export default bexContent((/* bridge */) => {
  setupPageStreams()
  setupExtensionStreams()
})
