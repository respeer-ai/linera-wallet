import { dbWallet } from 'src/controller'
import { dbModel } from 'src/model'

export class MicrochainOwnerFungibleTokenBalance {
  static balance = async (
    microchain: string,
    owner: string,
    token: number
  ): Promise<dbModel.MicrochainOwnerFungibleTokenBalance | undefined> => {
    return (await dbWallet.microchainOwnerFungibleTokenBalances.toArray()).find(
      (el) =>
        el.microchain === microchain &&
        el.owner === owner &&
        el.tokenId === token
    )
  }

  static balances = async (
    owner: string,
    token: number
  ): Promise<dbModel.MicrochainOwnerFungibleTokenBalance[]> => {
    return (
      await dbWallet.microchainOwnerFungibleTokenBalances.toArray()
    ).filter(
      (el) => el.owner === owner && el.tokenId === token && el.balance > 0
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

  static update = async (
    balance: dbModel.MicrochainOwnerFungibleTokenBalance
  ) => {
    return await dbWallet.microchainOwnerFungibleTokenBalances.update(
      balance.id,
      balance
    )
  }
}
