import { sharedStore } from 'app/src-bex/store'
import { RpcRequest } from '../types'

export const getProviderStateHandler = async (request: RpcRequest) => {
  try {
    const auth = await sharedStore.getRpcAuth(request.origin)
    if (!auth) {
      return Promise.reject(new Error('Invalid rpc auth'))
    }
    return Promise.resolve({
      isUnlocked: true,
      accounts: [auth?.publicKey],
      chainId: '0x' + auth?.chainId,
      networkVersion: '12734'
    })
  } catch (e) {
    return Promise.reject(new Error(JSON.stringify(e)))
  }
}
