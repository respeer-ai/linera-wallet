import browser, { Windows } from 'webextension-polyfill'
import {
  NOTIFICATION_HEIGHT,
  NOTIFICATION_WIDTH
} from '../const'
import { sharedStore } from '../store'
import { basebridge } from '../event'

/**
 * A collection of methods for controlling the showing and hiding of the notification popup.
 */
export default class NotificationManager {
  constructor () {
    basebridge.EventBus.bridge?.on('popup.closed', ({ data, respond }) => {
      console.log(data)
      void respond()
    })
  }

  public async showPopup (): Promise<Error | undefined> {
    const currentPopupId = await sharedStore.getCurrentPopupId()
    if (currentPopupId > 0) {
      await basebridge.EventBus.bridge?.send('popup.new', { a: 'b' })
    } else {
      browser.windows.getCurrent().then(async (window: Windows.Window) => {
        const { width } = window
        const left = (width || 1280) - NOTIFICATION_WIDTH - 48
        const top = 48
        await browser.windows.create({
          url: browser.runtime.getURL('www/index.html#/extension/popup'),
          type: 'popup',
          width: NOTIFICATION_WIDTH,
          height: NOTIFICATION_HEIGHT,
          left,
          top
        })
      }).catch((e) => {
        console.log('Fail create popup', e)
      })
    }
    return Promise.resolve(undefined)
  }
}
