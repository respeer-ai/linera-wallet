import { dbBase, dbWallet } from 'src/controller'
import { db } from 'src/model'

export class OwnerBalance {
  static getTokenBalance = async (owner?: db.Owner, tokenId?: number) => {
    owner = owner || (await dbWallet.owners.toArray()).find((el) => el.selected)
    if (!owner) return

    const microchainOwners = (await dbWallet.microchainOwners.toArray()).filter(
      (el) => el.owner === owner?.owner
    )
    const microchains = microchainOwners.reduce<string[]>(
      (microchainIds: string[], a) => {
        microchainIds.push(a.microchain)
        return microchainIds
      },
      []
    )

    const microchainFungibleTokenBalances = (
      await dbWallet.microchainFungibleTokenBalances
        .where('microchain')
        .anyOf(microchains)
        .toArray()
    ).filter((el) => {
      return tokenId !== undefined ? tokenId === el.tokenId : true
    })
    const microchainOwnerFungibleTokenBalances = (
      await dbWallet.microchainOwnerFungibleTokenBalances
        .where('owner')
        .equals(owner?.owner)
        .toArray()
    ).filter((el) => {
      return tokenId !== undefined ? tokenId === el.tokenId : true
    })

    const tokenIds = microchainFungibleTokenBalances.reduce<number[]>(
      (ids: number[], a) => {
        ids.push(a.tokenId)
        return ids
      },
      []
    )
    tokenIds.concat(
      ...microchainOwnerFungibleTokenBalances.reduce<number[]>(
        (ids: number[], a) => {
          ids.push(a.tokenId)
          return ids
        },
        []
      )
    )

    if (tokenId === undefined) return 0

    return (
      microchainOwnerFungibleTokenBalances.reduce(
        (sum, a) => sum + Number(a.balance || 0),
        0
      ) +
      microchainFungibleTokenBalances.reduce(
        (sum, a) => sum + Number(a.balance || 0),
        0
      )
    )
  }

  static getUsdBalance = async (owner?: db.Owner, tokenId?: number) => {
    owner = owner || (await dbWallet.owners.toArray()).find((el) => el.selected)
    if (!owner) return

    let usdBalance = 0

    const microchainOwners = (await dbWallet.microchainOwners.toArray()).filter(
      (el) => el.owner === owner?.owner
    )
    const microchains = microchainOwners.reduce<string[]>(
      (microchainIds: string[], a) => {
        microchainIds.push(a.microchain)
        return microchainIds
      },
      []
    )

    const microchainFungibleTokenBalances = (
      await dbWallet.microchainFungibleTokenBalances
        .where('microchain')
        .anyOf(microchains)
        .toArray()
    ).filter((el) => {
      return tokenId !== undefined ? tokenId === el.tokenId : true
    })
    const microchainOwnerFungibleTokenBalances = (
      await dbWallet.microchainOwnerFungibleTokenBalances
        .where('owner')
        .equals(owner?.owner)
        .toArray()
    ).filter((el) => {
      return tokenId !== undefined ? tokenId === el.tokenId : true
    })

    const tokenIds = microchainFungibleTokenBalances.reduce<number[]>(
      (ids: number[], a) => {
        ids.push(a.tokenId)
        return ids
      },
      []
    )
    tokenIds.concat(
      ...microchainOwnerFungibleTokenBalances.reduce<number[]>(
        (ids: number[], a) => {
          ids.push(a.tokenId)
          return ids
        },
        []
      )
    )
    const tokens = await dbBase.tokens.where('id').anyOf(tokenIds).toArray()

    usdBalance =
      microchainOwnerFungibleTokenBalances.reduce(
        (sum, a) =>
          sum +
          Number(a.balance || 0) *
            (tokens.find((el) => el.id === a.tokenId)?.usdCurrency || 0),
        0
      ) +
      microchainFungibleTokenBalances.reduce(
        (sum, a) =>
          sum +
          Number(a.balance || 0) *
            (tokens.find((el) => el.id === a.tokenId)?.usdCurrency || 0),
        0
      )

    return usdBalance
  }
}
