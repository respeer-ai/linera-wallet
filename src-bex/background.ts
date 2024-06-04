/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { bexBackground } from 'quasar/wrappers'
import browser from 'webextension-polyfill'

declare module '@quasar/app-vite' {
  interface BexEventMap {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    log: [{ message: string, data?: any[] }, never]
    getTime: [never, number]

    'storage.get': [{ key: string | null }, any]
    'storage.set': [{ key: string, value: any }, any]
    'storage.remove': [{ key: string }, any]
    /* eslint-enable @typescript-eslint/no-explicit-any */
  }
}

export default bexBackground((bridge /* , allActiveConnections */) => {
  bridge.on('buttonClicked', ({ respond }) => {
    console.log('Bridge1', bridge)
    browser.windows.getCurrent()
      .then((currentWindow) => {
        const windowWidth = 365
        const windowHeight = 716
        const windowLeft = currentWindow?.width as number - 40
        const windowTop = 0
        browser.windows.create({
          url: browser.runtime.getURL('www/index.html#/extension/popup'),
          type: 'popup',
          width: windowWidth,
          height: windowHeight,
          left: Math.max(0, windowLeft),
          top: Math.min(0, windowTop)
        }).then((createdWindow) => {
          // Store the ID of the created window
          const createdWindowId = createdWindow?.id

          // Add a listener to handle messages from the popup
          browser.runtime.onMessage.addListener(function messageListener (message) {
            if (message.type === 'RESULT_FROM_POPUP') {
              // Handle the result here
              const resultData = message.data

              // Respond back to the caller with the result data
              respond(resultData)

              // Remove the listener to avoid memory leaks
              browser.runtime.onMessage.removeListener(messageListener)

              // Optionally, close the popup window
              browser.windows.remove(createdWindowId as number)
            }
          })
        })
      })
  })
})
