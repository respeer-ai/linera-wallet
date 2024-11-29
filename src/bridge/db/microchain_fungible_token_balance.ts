import { dbWallet } from 'src/controller'
import { db } from 'src/model'

export class MicrochainFungibleTokenBalance {
  static create = async (microchain: db.Microchain, tokenId: number, balance: number) => {
    await dbWallet.microchainFungibleTokenBalances.add({
      microchain: microchain.microchain,
      tokenId,
      balance
    })
  }

  static update = async (balance: db.MicrochainFungibleTokenBalance) => {
    await dbWallet.microchainFungibleTokenBalances.update(balance.id, balance)
  }

  static balance = async (microchain: db.Microchain, tokenId: number): Promise<db.MicrochainFungibleTokenBalance | undefined> => {
    return (await dbWallet.microchainFungibleTokenBalances.toArray()).find((el) => el.microchain === microchain.microchain && el.tokenId === tokenId)
  }
}
