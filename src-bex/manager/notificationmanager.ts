import browser, { Windows } from 'webextension-polyfill'
import type { JsonRpcParams } from '@metamask/utils'
import {
  NOTIFICATION_HEIGHT,
  NOTIFICATION_WIDTH
} from '../const'

/**
 * A collection of methods for controlling the showing and hiding of the notification popup.
 */
export default class NotificationManager {
  currentPopupId?: number

  createPopupWindow (resolve: (newWindowId?: number) => void, reject: (err: Error) => void, requestId: string | number, params?: JsonRpcParams) {
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
            let _params = ''
            if (params) {
              _params = '&params=' + encodeURIComponent(JSON.stringify(params))
            }
            browser.windows.create({
              url: browser.runtime.getURL('www/index.html#/extension/popup?requestId=' + requestId.toString() + _params),
              type: 'popup',
              width: NOTIFICATION_WIDTH,
              height: NOTIFICATION_HEIGHT,
              left,
              top,
              focused: true
            }).then((_window: Windows.Window) => {
              this.currentPopupId = _window.id
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

  public async showPopup (requestId: string | number, params?: JsonRpcParams): Promise<number | undefined> {
    return new Promise<number | undefined>((resolve, reject) => {
      this.createPopupWindow(resolve, reject, requestId, params)
    })
  }
}
