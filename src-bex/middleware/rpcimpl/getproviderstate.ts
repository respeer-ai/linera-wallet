import { sharedStore } from 'app/src-bex/store'
import { RpcRequest } from '../types'

export const getProviderStateHandler = async (request?: RpcRequest) => {
  if (!request) {
    return Promise.reject(new Error('Invalid request'))
  }
  try {
    // TODO: get account from request
    const microchain = await sharedStore.getRpcMicrochain(request.origin, '')
    if (!microchain) {
      return Promise.reject(new Error('Invalid microchain'))
    }
    return Promise.resolve({
      isUnlocked: true,
      accounts: [],
      chainId: '0x' + microchain,
      networkVersion: '1'
    })
  } catch (e) {
    return Promise.reject(new Error(JSON.stringify(e)))
  }
}
