// Hooks added here have a bridge allowing communication between the Web Page and the BEX Content Script.
// More info: https://quasar.dev/quasar-cli/developing-browser-extensions/dom-hooks
import { bexDom } from 'quasar/wrappers'

export default bexDom((bridge) => {
  /*
  bridge.send('message.to.quasar', {
    worked: true
  })
  */

  window.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('#myButton')
    if (button) {
      button.addEventListener('click', () => {
        console.log('clicked')
        void bridge.send('buttonClicked')
      })
    }
  })
  console.log('from dom')
})
