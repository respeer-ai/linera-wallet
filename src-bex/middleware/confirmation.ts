/* eslint-disable @typescript-eslint/no-unused-vars */
import type { JsonRpcRequest, Json, PendingJsonRpcResponse, JsonRpcParams } from '@metamask/utils'
import { NOTIFICATION_HEIGHT, NOTIFICATION_WIDTH } from '../const'
import ExtensionPlatform from '../platforms/extension'
import browser from 'webextension-polyfill'
type JsonRpcEngineReturnHandler = (done: (error?: unknown) => void) => void;
type JsonRpcEngineEndCallback = (error?: unknown) => void;
type JsonRpcEngineNextCallback = (returnHandlerCallback?: JsonRpcEngineReturnHandler) => void;

const platform = new ExtensionPlatform()

export const showPopup = async () => {
  await browser.windows.getCurrent().then(async (currentWindow) => {
    const top = 0
    const left = Math.max(currentWindow.width as number - NOTIFICATION_WIDTH, 0)
    const popupWindow = await platform.openWindow({
      url: browser.runtime.getURL('www/index.html#/extension/popup'),
      type: 'popup',
      width: NOTIFICATION_WIDTH,
      height: NOTIFICATION_HEIGHT,
      left,
      top
    })
  })

  // Firefox currently ignores left/top for create, but it works for update
  // if (popupWindow.left !== left && popupWindow.state !== 'fullscreen') {
  //   await platform.updateWindowPosition(popupWindow.id as number, left, top)
  // }
  // pass new created popup window id to appController setter
  // and store the id to private variable this._popupId for future access
  // this._setCurrentPopupId(popupWindow.id)
  // this._popupId = popupWindow.id
}

export const needConfirm = () => {
  return false
}

export const userConfirm = (req: JsonRpcRequest<JsonRpcParams>, res: PendingJsonRpcResponse<Json>, next: JsonRpcEngineNextCallback, end: JsonRpcEngineEndCallback) => {
  if (req.method === 'eth_requestAccounts') {
    showPopup().then((resp) => {
      console.log('resp: ', resp)
    }).catch((error) => {
      console.log('popup: ', error)
    })
  }
  res.result = req
  end()
}
