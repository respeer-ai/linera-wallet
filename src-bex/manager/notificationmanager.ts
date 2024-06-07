import browser, { Windows } from 'webextension-polyfill'
import {
  NOTIFICATION_HEIGHT,
  NOTIFICATION_WIDTH
} from '../const'

/**
 * A collection of methods for controlling the showing and hiding of the notification popup.
 */
export default class NotificationManager {
  currentPopupId?: number

  createPopupWindow (
    resolve: (newWindowId?: number) => void,
    reject: (err: Error) => void,
    requestId: number,
    onWindowClosed: (requestId: number) => void
  ) {
    browser.windows.getAll()
      .then(async (windows: Windows.Window[]) => {
        const _window = windows?.find((window: Windows.Window) => {
          return window && window.type === 'popup' && Number(window.id) === this.currentPopupId
        })
        if (_window) {
          await browser.windows.update(_window.id as number, { focused: true })
          return resolve()
        }
        browser.windows.getCurrent()
          .then((_window: Windows.Window) => {
            const { width } = _window
            const left = (width || 1280) - NOTIFICATION_WIDTH - 48
            const top = 48
            browser.windows.create({
              url: browser.runtime.getURL('www/index.html#/extension/popup'),
              type: 'popup',
              width: NOTIFICATION_WIDTH,
              height: NOTIFICATION_HEIGHT,
              left,
              top,
              focused: true
            }).then((_window: Windows.Window) => {
              this.currentPopupId = _window.id
              const listener = (windowId: number) => {
                if (_window.id === windowId) {
                  browser.windows.onRemoved.removeListener(listener)
                  onWindowClosed(requestId)
                }
              }
              browser.windows.onRemoved.addListener(listener)
              resolve(_window.id)
            }).catch((e: Error) => {
              reject(e)
            })
          }).catch((e: Error) => {
            reject(e)
          })
      })
      .catch((e: Error) => {
        reject(e)
      })
  }

  public async showPopup (
    requestId: number,
    onWindowClosed: (requestId: number) => void
  ): Promise<number | undefined> {
    return new Promise<number | undefined>((resolve, reject) => {
      this.createPopupWindow(resolve, reject, requestId, onWindowClosed)
    })
  }
}
