/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks

import { bexContent } from 'quasar/wrappers'
import browser from 'webextension-polyfill'
import { WindowPostMessageStream } from '@metamask/post-message-stream'
import ObjMultiplex from '@metamask/object-multiplex'
import process from 'process'
window.process = process
import pump from 'pump'

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

export default bexContent((bridge) => {
  setupPageStreams()

  browser.runtime.onMessage.addListener(msg => {
    console.log(msg)
    return bridge.send('buttonClicked')
  })
})
