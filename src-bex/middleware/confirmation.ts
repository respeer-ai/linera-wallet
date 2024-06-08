import NotificationManager from '../manager/notificationmanager'
import { basebridge } from '../event'
import { PopupRequestType, RpcRequest, RpcMethod } from './types'
import { commontypes } from '../../src/types'
import { BexPayload } from '@quasar/app-vite'

const notificationManager = new NotificationManager()

const confirmations = new Map<RpcMethod, boolean>([
  [RpcMethod.GET_PROVIDER_STATE, false],
  [RpcMethod.ETH_REQUEST_ACCOUNTS, true],
  [RpcMethod.CHECKO_PING, false]
])

export const needConfirm = (req: RpcRequest): boolean => {
  const shouldConfirm = confirmations.get(req.request.method as RpcMethod)
  return shouldConfirm === undefined || shouldConfirm
}

// TODO: DelayMs is workaround for the first message of bridge
const confirmationWithExistPopup = (req: RpcRequest, resolve: () => void, reject: (err: Error) => void, delayMs: number) => {
  setTimeout(() => {
    basebridge.EventBus.bridge?.send('popup.new', {
      type: PopupRequestType.CONFIRMATION,
      request: req
    }).then((payload: BexPayload<commontypes.ConfirmationPopupResponse, unknown>) => {
      if (!payload.data.approved) {
        return reject(new Error('Rejected by user'))
      }
      resolve()
    }).catch((e: Error) => {
      reject(e)
    })
  }, delayMs)
}

export const confirmationHandler = async (req: RpcRequest): Promise<void> => {
  if (!needConfirm(req)) {
    return await Promise.resolve(undefined)
  }

  return new Promise<void>((resolve, reject) => {
    const requestId = Number(req.request.id)
    let responded = false

    notificationManager.showPopup(requestId, (_requestId: number) => {
      if (responded) {
        return
      }
      if (requestId === _requestId) {
        return reject(new Error('Rejected by user'))
      }
    }).then((newWindowId?: number) => {
      confirmationWithExistPopup(req, () => {
        resolve()
        responded = true
      }, () => {
        reject()
        responded = true
      }, newWindowId !== undefined ? 1000 : 0)
    }).catch((e: Error) => {
      reject(e)
    })
  })
}
