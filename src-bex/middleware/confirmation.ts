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

const confirmationWithExistPopup = (resolve: () => void, reject: (err: Error) => void) => {
  basebridge.EventBus.bridge?.send('popup.new')
    .then(() => {
      resolve()
    })
    .catch((e: Error) => {
      reject(e)
    })
}

export const confirmationHandler = async (req: JsonRpcRequest<JsonRpcParams>): Promise<void> => {
  if (!needConfirm(req)) {
    return await Promise.resolve(undefined)
  }

  return new Promise<void>((resolve, reject) => {
    const requestId = Number(req.id)
    const newHPopupHandler = (payload: BexPayload<number, undefined>) => {
      console.log('New popup.done', payload)
      // basebridge.EventBus.bridge?.off('popup.done', newHPopupHandler)
      if (payload.data === requestId) {
        resolve()
      }
    }
    basebridge.EventBus.bridge?.on('popup.done', newHPopupHandler)
    notificationManager.showPopup(requestId, req.params)
      .then((newWindowId?: number) => {
        if (newWindowId) {
          // Params already sent with query url, we need to wait for popup.done
          return
        }
        confirmationWithExistPopup(resolve, reject)
      })
      .catch((e: Error) => {
        reject(e)
      })
  })
}
