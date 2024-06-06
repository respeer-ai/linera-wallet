import type { JsonRpcRequest, JsonRpcParams } from '@metamask/utils'
import { RpcMethod } from './rpc'
import NotificationManager from '../manager/notification-manager'
import AppStateController from '../controller/app-state'

const notificationManager = new NotificationManager()
const appStateController = new AppStateController()

const confirmations = new Map<RpcMethod, boolean>([
  [RpcMethod.GET_PROVIDER_STATE, false],
  [RpcMethod.ETH_REQUEST_ACCOUNTS, true]
])

export const needConfirm = (req: JsonRpcRequest<JsonRpcParams>): boolean => {
  return confirmations.get(req.method as RpcMethod) || false
}

export const confirmationHandler = async (req: JsonRpcRequest<JsonRpcParams>) => {
  if (!needConfirm(req)) {
    return
  }
  return await notificationManager.showPopup(
    (newPopupId: number | undefined) => appStateController.setCurrentPopupId(newPopupId),
    appStateController.getCurrentPopupId()
  )
}
