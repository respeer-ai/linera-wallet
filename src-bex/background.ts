/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { bexBackground } from 'quasar/wrappers'

function openExtension () {
  // chrome.windows.create(
  //   {
  //     url: chrome.runtime.getURL('www/index.html'),
  //     type: 'popup',
  //     width: 451,
  //     height: 605
  //   },
  //   (/* newTab */) => {
  //     // Tab opened.
  //   }
  // )
}

chrome.runtime.onInstalled.addListener(openExtension)
chrome.action.onClicked.addListener(openExtension)
// https://stackoverflow.com/questions/10994324/chrome-extension-content-script-re-injection-after-upgrade-or-install
// chrome.runtime.onInstalled.addListener(async () => {
//   const manifest = chrome.runtime.getManifest()
//   if (manifest.content_scripts) {
//     for (const cs of manifest.content_scripts) {
//       const tabs = await chrome.tabs.query({ url: cs.matches })
//       for (const tab of tabs) {
//         if (tab.url && !tab.url.match(/(chrome|chrome-extension):\/\//gi)) {
//           chrome.scripting.executeScript({
//             files: cs.js as string[],
//             target: { tabId: tab.id!, allFrames: cs.all_frames },
//             injectImmediately: cs.run_at === 'document_start'
//             // world: cs.world // uncomment if you use it in manifest.json in Chrome 111+
//           })
//         }
//       }
//     }
//   }
// })

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

let receivedData = {}

export default bexBackground((bridge /* , allActiveConnections */) => {
  // bridge.on('log', ({ data, respond }) => {
  //   console.log(`[BEX] ${data.message}`, ...(data.data || []))
  //   respond()
  // })

  // 监听content script中的事件
  bridge.on('buttonClicked', ({ data, respond }) => {
    console.log('data: ', data)
    receivedData = data
    chrome.windows.getCurrent((currentWindow) => {
      const windowWidth = 365
      const windowHeight = 716
      const windowLeft = currentWindow?.width as number - 40
      const windowTop = 0
      chrome.windows.create({
        url: chrome.runtime.getURL('www/index.html#/extension/popup'),
        type: 'popup',
        width: windowWidth,
        height: windowHeight,
        left: Math.max(0, windowLeft),
        top: Math.min(0, windowTop)
      }, (createdWindow) => {
        // Store the ID of the created window
        const createdWindowId = createdWindow?.id
        console.log('window id: ', createdWindowId)

        // Add a listener to handle messages from the popup
        chrome.runtime.onMessage.addListener(function messageListener (message) {
          if (message.type === 'RESULT_FROM_POPUP') {
            console.log('Result received from popup:', message.data)
            // Handle the result here
            const resultData = message.data

            // Respond back to the caller with the result data
            respond(resultData)

            // Remove the listener to avoid memory leaks
            chrome.runtime.onMessage.removeListener(messageListener)

            // Optionally, close the popup window
            chrome.windows.remove(createdWindowId as number)
          }
        })
      })
    })
  })

  // 提供一个接口让弹出页面获取数据
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('---------from background.js ')
    if (message.action === 'getData') {
      sendResponse(receivedData)
    }
  })

  bridge.on('getTime', ({ respond }) => {
    respond(Date.now())
  })

  bridge.on('storage.get', ({ data, respond }) => {
    const { key } = data
    if (key === null) {
      chrome.storage.local.get(null, (items) => {
        // Group the values up into an array to take advantage of the bridge's chunk splitting.
        respond(Object.values(items))
      })
    } else {
      chrome.storage.local.get([key], (items) => {
        respond(items[key])
      })
    }
  })
  // Usage:
  // const { data } = await bridge.send('storage.get', { key: 'someKey' })

  bridge.on('storage.set', ({ data, respond }) => {
    chrome.storage.local.set({ [data.key]: data.value }, () => {
      respond()
    })
  })
  // Usage:
  // await bridge.send('storage.set', { key: 'someKey', value: 'someValue' })

  bridge.on('storage.remove', ({ data, respond }) => {
    chrome.storage.local.remove(data.key, () => {
      respond()
    })
  })
  // Usage:
  // await bridge.send('storage.remove', { key: 'someKey' })

  /*
  // EXAMPLES
  // Listen to a message from the client
  bridge.on('test', d => {
    console.log(d)
  })

  // Send a message to the client based on something happening.
  chrome.tabs.onCreated.addListener(tab => {
    bridge.send('browserTabCreated', { tab })
  })

  // Send a message to the client based on something happening.
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      bridge.send('browserTabUpdated', { tab, changeInfo })
    }
  })
   */
})
