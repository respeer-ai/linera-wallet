import { dbWallet } from 'src/controller'
import { db } from 'src/model'
import { Network } from './network'
import { MicrochainOwner } from './microchain_owner'

export class Microchain {
  static microchains = async (
    offset: number,
    limit: number,
    imported?: boolean
  ): Promise<db.Microchain[]> => {
    return (
      await dbWallet.microchains.offset(offset).limit(limit).toArray()
    ).filter((el) => !imported || el.imported)
  }

  static microchain = async (
    microchain: string
  ): Promise<db.Microchain | undefined> => {
    return await dbWallet.microchains
      .where('microchain')
      .equals(microchain)
      .first()
  }

  static anyMicrochain = async (): Promise<db.Microchain | undefined> => {
    return await dbWallet.microchains.offset(0).first()
  }

  static count = async (): Promise<number> => {
    return await dbWallet.microchains.count()
  }

  static ownerMicrochains = async (
    offset: number,
    limit: number,
    owner: string,
    imported?: boolean
  ): Promise<db.Microchain[]> => {
    const microchainOwners = await dbWallet.microchainOwners
      .where('owner')
      .equals(owner)
      .toArray()
    return (
      await dbWallet.microchains.offset(offset).limit(limit).toArray()
    ).filter((microchain) => {
      return (
        microchainOwners.findIndex(
          (el) => el.owner === owner && el.microchain === microchain.microchain
        ) >= 0 &&
        (!imported || microchain.imported)
      )
    })
  }

  static microchainOwner = async (
    microchain: string
  ): Promise<db.Owner | undefined> => {
    const microchainOwners = (await dbWallet.microchainOwners.toArray()).filter(
      (el) => el.microchain === microchain
    )
    if (!microchainOwners.length) return undefined
    return (await dbWallet.owners.toArray()).find(
      (el) => microchainOwners.findIndex((el1) => el1.owner === el.owner) >= 0
    )
  }

  static create = async (
    owner: string,
    microchainId: string,
    messageId?: string,
    certificateHash?: string,
    name?: string,
    _default?: boolean
  ): Promise<db.Microchain> => {
    let microchain = await dbWallet.microchains
      .where('microchain')
      .equals(microchainId)
      .first()
    if (microchain) return microchain
    const selectedNetwork = await Network.selected()
    if (!selectedNetwork) return Promise.reject('Invalid network')
    microchain = {
      microchain: microchainId,
      balance: 0,
      messageId,
      certificateHash,
      networkId: selectedNetwork.id,
      name,
      default: _default,
      imported: true,
      state: db.MicrochainState.CLAIMING
    } as db.Microchain
    await MicrochainOwner.create(owner, microchainId)
    await dbWallet.microchains.add(microchain)
    return microchain
  }

  static update = async (microchain: db.Microchain) => {
    await dbWallet.microchains.update(microchain.id, microchain)
  }
}
