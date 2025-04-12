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

  static rpcMicrochain = async (
    origin: string,
    publicKey: string
  ): Promise<string | undefined> => {
    return (await dbBase.rpcMicrochains.toArray()).find(
      (el) => el.origin === origin && el.publicKey === publicKey
    )?.microchain
  }

  static originPublicKeys = async (origin: string): Promise<string[]> => {
    return (await dbBase.rpcMicrochains.toArray())
      .filter((el) => el.origin === origin)
      .map((el) => el.publicKey)
      .reduce((ids: string[], el): string[] => {
        if (!ids.includes(el)) ids.push(el)
        return ids
      }, [])
  }

  static authenticated = async (
    origin: string,
    method: RpcMethod,
    applicationId?: string,
    operation?: string
  ) => {
    if (method === RpcMethod.LINERA_GRAPHQL_MUTATION && !operation)
      return Promise.reject('Invalid operation')
    return (
      (await dbBase.rpcAuths.toArray()).findIndex(
        (el) =>
          el.origin === origin &&
          el.method === method &&
          (applicationId === undefined || el.applicationId === applicationId) &&
          (operation === undefined || el.operation === operation) &&
          el.expiredAt > Date.now()
      ) >= 0
    )
  }

  static originMicrochains = async (origin: string): Promise<string[]> => {
    return (await dbBase.rpcMicrochains.toArray())
      .filter((el) => el.origin === origin)
      .map((el) => el.microchain)
  }
}
