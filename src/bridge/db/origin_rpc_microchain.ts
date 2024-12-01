import { dbBase } from 'src/controller'
import { db } from 'src/model'

export class OriginRpcMicrochain {
  static formalize = async (origin: string) => {
    const microchains = await dbBase.rpcMicrochains
      .where('origin')
      .equals(origin)
      .toArray()
    if (microchains.length > 1) {
      for (const microchain of microchains) {
        await dbBase.rpcMicrochains.delete(microchain.id)
      }
    }
  }

  static create = async (
    origin: string,
    publicKey: string,
    microchain: string
  ) => {
    await OriginRpcMicrochain.formalize(origin)
    const _microchain =
      (await dbBase.rpcMicrochains.where('origin').equals(origin).first()) ||
      ({
        origin,
        publicKey,
        microchain
      } as db.OriginRpcMicrochain)
    _microchain.microchain = microchain
    _microchain.id === undefined
      ? await dbBase.rpcMicrochains.add(_microchain)
      : await dbBase.rpcMicrochains.update(_microchain.id, _microchain)
  }

  static delete = async (id: number) => {
    await dbBase.rpcMicrochains.delete(id)
  }

  static getOriginRpcMicrochain = async (origin: string) => {
    return await dbBase.rpcMicrochains.where('origin').equals(origin).first()
  }
}
