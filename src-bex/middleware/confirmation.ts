import type { JsonRpcRequest, JsonRpcParams } from '@metamask/utils'
import { RpcMethod } from './rpc'
import NotificationManager from '../manager/notification-manager'

const notificationManager = new NotificationManager()

const confirmations = new Map<RpcMethod, boolean>([
  [RpcMethod.GET_PROVIDER_STATE, false],
  [RpcMethod.ETH_REQUEST_ACCOUNTS, true]
])

export const needConfirm = (req: JsonRpcRequest<JsonRpcParams>): boolean => {
  return !!confirmations.get(req.method as RpcMethod)
}

export const confirmationHandler = async (req: JsonRpcRequest<JsonRpcParams>): Promise<Error | undefined> => {
  if (!needConfirm(req)) {
    return await Promise.resolve(undefined)
  }
  return await notificationManager.showPopup()
}
