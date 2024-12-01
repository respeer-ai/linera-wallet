import { dbWallet } from 'src/controller'
import { db } from 'src/model'

export class MicrochainOwnerFungibleTokenBalance {
  static balance = async (
    microchain: string,
    owner: string,
    token: number
  ): Promise<db.MicrochainOwnerFungibleTokenBalance | undefined> => {
    return (await dbWallet.microchainOwnerFungibleTokenBalances.toArray()).find(
      (el) =>
        el.microchain === microchain &&
        el.owner === owner &&
        el.tokenId === token
    )
  }

  static create = async (
    microchain: string,
    owner: string,
    token: number,
    balance: number
  ) => {
    return await dbWallet.microchainOwnerFungibleTokenBalances.add({
      microchain,
      owner,
      tokenId: token,
      balance
    })
  }

  static update = async (balance: db.MicrochainOwnerFungibleTokenBalance) => {
    return await dbWallet.microchainOwnerFungibleTokenBalances.update(
      balance.id,
      balance
    )
  }
}
