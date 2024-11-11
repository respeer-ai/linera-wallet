import { RpcRequest, RpcMethod } from './types'
import { sharedStore } from '../store'
import InstallationManager from '../manager/installationmanager'

const accountInterceptors = new Map<RpcMethod, boolean>([
  [RpcMethod.ETH_REQUEST_ACCOUNTS, true]
])

const installationManager = new InstallationManager()

export const accountInterceptorHandler = async (
  req: RpcRequest
): Promise<void> => {
  const needAccount = accountInterceptors.get(req.request.method as RpcMethod)
  if (needAccount) {
    if (!(await sharedStore.getAccounts()).length) {
      void installationManager.openExtensionInBrowser()
      return Promise.reject('No available account')
    }
  }
}
