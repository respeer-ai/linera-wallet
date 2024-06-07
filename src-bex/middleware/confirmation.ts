import type { JsonRpcRequest, JsonRpcParams } from '@metamask/utils'
import { RpcMethod } from './rpc'
import NotificationManager from '../manager/notificationmanager'
import { basebridge } from '../event'
// import { BexPayload } from '@quasar/app-vite'

const notificationManager = new NotificationManager()

const confirmations = new Map<RpcMethod, boolean>([
  [RpcMethod.GET_PROVIDER_STATE, false],
  [RpcMethod.ETH_REQUEST_ACCOUNTS, true]
])

export const needConfirm = (req: JsonRpcRequest<JsonRpcParams>): boolean => {
  return !!confirmations.get(req.method as RpcMethod)
}

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

export const confirmationHandler = async (req: JsonRpcRequest<JsonRpcParams>): Promise<void> => {
  if (!needConfirm(req)) {
    return await Promise.resolve(undefined)
  }

  return new Promise<void>((resolve, reject) => {
    const requestId = Number(req.id)
    /*
    const newHPopupHandler = (payload: BexPayload<number, undefined>) => {
      console.log('New popup.done', payload)
      // basebridge.EventBus.bridge?.off('popup.done', newHPopupHandler)
      if (payload.data === requestId) {
        resolve()
      }
    }
    basebridge.EventBus.bridge?.on('popup.done', newHPopupHandler)
    */
    notificationManager.showPopup(requestId, req.params)
      .then((newWindowId?: number) => {
        confirmationWithExistPopup(requestId, resolve, reject, newWindowId !== undefined ? 100 : 0)
      })
      .catch((e: Error) => {
        reject(e)
      })
  })
}
