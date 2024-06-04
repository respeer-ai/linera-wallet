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
import { Substream } from '@metamask/object-multiplex/dist/Substream'
import { Buffer as BufferPolyfill } from 'buffer'

window.Buffer = BufferPolyfill
window.process = process

let pageChannel: Substream,
  extensionMux: ObjMultiplex,
  extensionChannel: Substream,
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
  extensionStream.on('data', msg => {
    console.log('Extension stream data', msg)
  })

  // create and connect channel muxers
  // so we can handle the channels individually
  extensionMux = new ObjMultiplex()
  extensionMux.setMaxListeners(25)

  pump(extensionMux, extensionStream, extensionMux, (e) => {
    console.log('CheCko Background Multiplex', e)
  })

  // TODO：page -> extension is not successful

  // forward communication across inpage-background for these channels only
  extensionChannel = extensionMux.createStream(constant.PROVIDER)
  pump(pageChannel, extensionChannel, pageChannel, (error) =>
    console.debug(
      `CheCko: Muxed traffic for channel "${constant.PROVIDER}" failed.`,
      error
    )
  )

  extensionChannel.on('data', msg => {
    console.log('Extension channel data', msg)
  })

  // eslint-disable-next-line no-use-before-define
  extensionPort.onDisconnect.addListener((port) => {
    console.log('Disconnect', port)
  })
}

export default bexContent((/* bridge */) => {
  setupPageStreams()
  setupExtensionStreams()
})
