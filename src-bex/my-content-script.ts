/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// Hooks added here have a bridge allowing communication between the BEX Content Script and the Quasar Application.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/content-hooks

import { bexContent } from 'quasar/wrappers'

console.log('Content script loaded')
interface TransferEvent {
  Amount: string
  Address: string
}

export default bexContent((bridge) => {
  // Hook into the bridge to listen for events sent from the client BEX.
  /*
  bridge.on('some.event', event => {
    if (event.data.yourProp) {
      // Access a DOM element from here.
      // Document in this instance is the underlying website the contentScript runs on
      const el = document.getElementById('some-id')
      if (el) {
        el.value = 'Quasar Rocks!'
      }
    }
  })
  */
  console.log('content script in bridge')
  // 在内容脚本中监听来自DOM的自定义事件
  window.addEventListener('message.to.quasar', (event: Event) => {
    const customEvent = event as CustomEvent<TransferEvent>
    console.log('event in: ', customEvent.detail)
    bridge.send('buttonClicked', { ...customEvent.detail })
      .then((response) => {
        // console.log('response from background, success: ', response)
        const elem = document.getElementById('extension')
        console.log('elem: ', elem)
        if (elem) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const { _value } = response.data.Message
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          elem.innerText = _value // display response on webpage
          console.log('data: ', _value)
        }
      }).catch((error) => {
        console.log('response from background.js, error: ', error)
      })
  })
})
