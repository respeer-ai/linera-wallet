import type { JsonRpcRequest, JsonRpcParams } from '@metamask/utils'
import { RpcMethod } from './rpc'
import NotificationManager from '../manager/notificationmanager'
import { basebridge } from '../event'
import { BexPayload } from '@quasar/app-vite'

const notificationManager = new NotificationManager()

const confirmations = new Map<RpcMethod, boolean>([
  [RpcMethod.GET_PROVIDER_STATE, false],
  [RpcMethod.ETH_REQUEST_ACCOUNTS, true]
])

export const needConfirm = (req: JsonRpcRequest<JsonRpcParams>): boolean => {
  return !!confirmations.get(req.method as RpcMethod)
}

// DelayMs is workaround for the first message of bridge
const confirmationWithExistPopup = (requestId: number, resolve: () => void, reject: (err: Error) => void, delayMs: number) => {
  setTimeout(() => {
    basebridge.EventBus.bridge?.send('popup.new', { requestId })
      .then(() => {
        resolve()
      })
      .catch((e: Error) => {
        reject(e)
      })
  }, delayMs)
}

interface PopupNewResponse {
  requestId: number
}

// It's not work very good
const newPopupHandler = (reject: (err: Error) => void): (payload: BexPayload<PopupNewResponse, undefined>) => void => {
  return (payload: BexPayload<PopupNewResponse, undefined>) => {
    if (payload.data.requestId === undefined) reject(new Error('Rejected by user'))
  }
}

export const confirmationHandler = async (req: JsonRpcRequest<JsonRpcParams>): Promise<void> => {
  if (!needConfirm(req)) {
    return await Promise.resolve(undefined)
  }

  return new Promise<void>((resolve, reject) => {
    const requestId = Number(req.id)

    const _newPopupHandler = newPopupHandler(reject)
    basebridge.EventBus.bridge?.once('popup.done', _newPopupHandler)

    notificationManager.showPopup(requestId, req.params)
      .then((newWindowId?: number) => {
        confirmationWithExistPopup(requestId, () => {
          basebridge.EventBus.bridge?.off('popup.done', _newPopupHandler)
          resolve()
        }, (e: Error) => {
          basebridge.EventBus.bridge?.off('popup.done', _newPopupHandler)
          reject(e)
        }, newWindowId !== undefined ? 1000 : 0)
      })
      .catch((e: Error) => {
        reject(e)
      })
  })
}
