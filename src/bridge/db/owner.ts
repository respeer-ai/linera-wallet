import { dbBase, dbWallet } from 'src/controller'
import { dbModel } from 'src/model'
import { Microchain } from './microchain'
import { MicrochainFungibleTokenBalance } from './microchain_fungible_token_balance'
import { MicrochainOwnerFungibleTokenBalance } from './microchain_owner_fungible_token_balance'

export class Owner {
  static resetSelected = async () => {
    const owners = (await dbWallet.owners.toArray()).filter((el) => el.selected)
    for (const owner of owners) {
      await dbWallet.owners.update(owner.id, { selected: false })
    }
  }

  static create = async (
    publicKey: string,
    privateKey: string,
    name?: string,
    _password?: string
  ) => {
    if (name && (await Owner.exists(name)))
      return Promise.reject('Already exist')

    if (!_password) {
      const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
      if (!fingerPrint) return Promise.reject('Invalid fingerprint')
      const passwd = (await dbBase.passwords.toArray()).find(
        (el) => el.active
      ) as dbModel.Password
      if (passwd)
        _password = dbModel.decryptPassword(passwd, fingerPrint.fingerPrint)
    }
    if (!publicKey.length || !privateKey.length || !_password?.length) {
      throw Error('Invalid owner materials')
    }
    if (!name) {
      // TODO: add field to store account number
      name =
        dbModel.DEFAULT_ACCOUNT_NAME +
        ' ' +
        (await dbWallet.owners.count()).toString()
    }
    if (
      (await dbWallet.owners.where('address').equals(publicKey).first()) !==
      undefined
    )
      return
    const owner = await dbModel.buildOwner(
      publicKey,
      privateKey,
      _password,
      name
    )
    await Owner.resetSelected()
    await dbWallet.owners.add(owner)
  }

  static update = async (owner: dbModel.Owner) => {
    if (
      (await Owner.exists(owner.name)) &&
      !(await Owner.exists(owner.name, owner.id))
    )
      return Promise.reject('Already exists')

    if (owner.selected) await Owner.resetSelected()
    await dbWallet.owners.update(owner.id, owner)
  }

  static delete = async (id: number) => {
    await dbWallet.owners.delete(id)
  }

  static ownerBalance = async (
    owner: dbModel.Owner,
    tokenId: number,
    microchain?: string
  ): Promise<{ tokenBalance: number; usdBalance: number }> => {
    const token = await dbBase.tokens.get(tokenId)
    if (!token) return Promise.reject('Invalid token')

    const microchains = (
      await Microchain.ownerMicrochains(0, 1000, owner.owner, true)
    ).filter(
      (_microchain) => !microchain || _microchain.microchain === microchain
    )

    let balance = 0
    for (const microchain of microchains) {
      balance +=
        (
          await MicrochainFungibleTokenBalance.balance(
            microchain.microchain,
            tokenId
          )
        )?.balance || 0
      balance +=
        (
          await MicrochainOwnerFungibleTokenBalance.balance(
            microchain.microchain,
            owner.owner,
            tokenId
          )
        )?.balance || 0
    }

    return {
      tokenBalance: balance,
      usdBalance: balance * (token?.usdCurrency || 0)
    }
  }

  static getOwnerWithPublicKey = async (publicKey: string) => {
    return (await dbWallet.owners.toArray()).find(
      (el) => el.address === publicKey
    )
  }

  static owner = async (owner: string) => {
    return (await dbWallet.owners.toArray()).find((el) => el.owner === owner)
  }

  static getOwnerWithPublicKeyPrefix = async (prefix: string) => {
    return (await dbWallet.owners.toArray()).find((el) =>
      el.address.includes(prefix.slice(prefix.startsWith('0x') ? 2 : 0))
    )
  }

  static publicKey2Owner = async (
    publicKey: string
  ): Promise<string | undefined> => {
    return (await dbWallet.owners.toArray()).find(
      (el) => el.address === publicKey
    )?.owner
  }

  static selected = async () => {
    return (await dbWallet.owners.toArray()).find((el) => el.selected)
  }

  static exists = async (name: string, id?: number) => {
    return (
      (await dbWallet.owners
        .where('name')
        .equals(name)
        .and((owner) => id === undefined || owner.id === id)
        .count()) > 0
    )
  }
}
