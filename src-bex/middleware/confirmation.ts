import NotificationManager from '../manager/notificationmanager'
import { basebridge } from '../event'
import { PopupRequestType, RpcRequest, RpcMethod } from './types'
import { commontypes } from '../../src/types'
import { BexPayload } from '@quasar/app-vite'
import { sharedStore } from '../store'

const notificationManager = new NotificationManager()

const confirmations = new Map<RpcMethod, boolean>([
  [RpcMethod.GET_PROVIDER_STATE, false],
  [RpcMethod.ETH_REQUEST_ACCOUNTS, true],
  [RpcMethod.CHECKO_PING, false],
  [RpcMethod.LINERA_GRAPHQL_MUTATION, true],
  [RpcMethod.LINERA_GRAPHQL_QUERY, false],
  [RpcMethod.LINERA_GRAPHQL_SUBSCRIPTION, false]
])

export const needConfirm = async (req: RpcRequest) => {
  let shouldConfirm = confirmations.get(req.request.method as RpcMethod)
  if (shouldConfirm) {
    shouldConfirm = !await sharedStore.authenticated(req.origin, req.request.method as RpcMethod)
  }
  return shouldConfirm === undefined || shouldConfirm
}

// TODO: DelayMs is workaround for the first message of bridge
const confirmationWithExistPopup = (req: RpcRequest, resolve: () => void, reject: (err: Error) => void, delayMs: number) => {
  setTimeout(() => {
    basebridge.EventBus.bridge?.send('popup.new', {
      type: PopupRequestType.CONFIRMATION,
      request: req
    }).then((payload: BexPayload<commontypes.ConfirmationPopupResponse, unknown>) => {
      console.log(999, payload.data)
      if (!payload.data.approved) {
        return reject(new Error(payload.data.message))
      }
      resolve()
    }).catch((e: Error) => {
      reject(e)
    })
  }, delayMs)
}

export const confirmationHandler = async (req: RpcRequest): Promise<void> => {
  if (!await needConfirm(req)) {
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
      }, (e: Error) => {
        reject(e)
        responded = true
      }, newWindowId !== undefined ? 1000 : 0)
    }).catch((e: Error) => {
      reject(e)
    })
  })
}
