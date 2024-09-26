import { sharedStore } from 'app/src-bex/store'
import { RpcRequest } from '../types'

export const getProviderStateHandler = async (request?: RpcRequest) => {
  if (!request) {
    return Promise.reject(new Error('Invalid request'))
  }
  try {
    const accounts = await sharedStore.getOriginPublicKeys(request.origin)
    const microchains = await sharedStore.getRpcMicrochains(request.origin)
    if (!microchains.length) {
      return Promise.reject(new Error('Invalid microchain'))
    }
    // TODO: who will be the default chain?
    return Promise.resolve({
      isUnlocked: true,
      accounts,
      chainId: '0x' + microchains[0],
      networkVersion: '1'
    })
  } catch (e) {
    return Promise.reject(new Error(JSON.stringify(e)))
  }
}
