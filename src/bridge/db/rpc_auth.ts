import { dbBase } from 'src/controller'
import { RpcMethod } from '../../../src-bex/middleware/types'

export class RpcAuth {
  static create = async (
    origin: string,
    publicKey: string,
    method: RpcMethod,
    applicationId?: string,
    operation?: string,
    persistAuth?: boolean
  ) => {
    // Each time we select microchain, we'll update it
    const microchain = (await dbBase.rpcMicrochains.toArray()).find(
      (el) => el.origin === origin
    )?.microchain
    if (!microchain) return
    await dbBase.rpcAuths.add({
      origin,
      publicKey,
      chainId: microchain,
      method,
      applicationId,
      operation,
      expiredAt: persistAuth ? Date.now() + 24 * 3600 * 1000 : 0
    })
  }

  static delete = async (id: number) => {
    await dbBase.rpcAuths.delete(id)
  }
}
