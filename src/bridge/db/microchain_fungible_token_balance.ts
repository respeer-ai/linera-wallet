import { dbWallet } from 'src/controller'
import { db } from 'src/model'
import { MicrochainOwner } from './microchain_owner'

export class MicrochainFungibleTokenBalance {
  static create = async (
    microchain: db.Microchain,
    tokenId: number,
    balance: number
  ) => {
    await dbWallet.microchainFungibleTokenBalances.add({
      microchain: microchain.microchain,
      tokenId,
      balance
    })
  }

  static update = async (balance: db.MicrochainFungibleTokenBalance) => {
    await dbWallet.microchainFungibleTokenBalances.update(balance.id, balance)
  }

  static balance = async (
    microchain: db.Microchain,
    tokenId: number
  ): Promise<db.MicrochainFungibleTokenBalance | undefined> => {
    return (await dbWallet.microchainFungibleTokenBalances.toArray()).find(
      (el) => el.microchain === microchain.microchain && el.tokenId === tokenId
    )
  }

  static balances = async (owner: db.Owner, tokenId: number) => {
    const microchains = (
      await MicrochainOwner.ownerMicrochainOwners(owner.owner)
    ).map((el) => el.microchain)
    return (await dbWallet.microchainFungibleTokenBalances.toArray()).filter(
      (el) =>
        microchains.includes(el.microchain) &&
        el.tokenId === tokenId &&
        el.balance > 0
    )
  }
}
