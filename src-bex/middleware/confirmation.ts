import type { JsonRpcRequest, JsonRpcParams } from '@metamask/utils'
import { RpcMethod } from './rpc'
import NotificationManager from '../manager/notificationmanager'
import { basebridge } from '../event'
import { commontypes } from '../../src/types'

const notificationManager = new NotificationManager()

const confirmations = new Map<RpcMethod, boolean>([
  [RpcMethod.GET_PROVIDER_STATE, false],
  [RpcMethod.ETH_REQUEST_ACCOUNTS, true]
])

export const needConfirm = (req: JsonRpcRequest<JsonRpcParams>): boolean => {
  return !!confirmations.get(req.method as RpcMethod)
}

// TODO: DelayMs is workaround for the first message of bridge
const confirmationWithExistPopup = (req: JsonRpcRequest<JsonRpcParams>, resolve: () => void, reject: (err: Error) => void, delayMs: number) => {
  setTimeout(() => {
    basebridge.EventBus.bridge?.send('popup.new', {
      type: commontypes.PopupRequestType.CONFIRMATION,
      request: req
    }).then(() => {
      resolve()
    }).catch((e: Error) => {
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

    notificationManager.showPopup(requestId, (_requestId: number) => {
      if (requestId === _requestId) {
        return reject(new Error('Rejected by user'))
      }
    }).then((newWindowId?: number) => {
      confirmationWithExistPopup(req, resolve, reject, newWindowId !== undefined ? 1000 : 0)
    }).catch((e: Error) => {
      reject(e)
    })
  })
}
