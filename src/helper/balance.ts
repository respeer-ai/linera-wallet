import { dbBridge, rpcBridge } from 'src/bridge'
import { dbModel } from 'src/model'

export class BalanceHelper {
  static updateChainBalance = async (
    microchain: string,
    tokenId: number,
    balance: number
  ) => {
    const microchainBalance =
      ((await dbBridge.MicrochainFungibleTokenBalance.balance(
        microchain,
        tokenId
      )) as dbModel.MicrochainFungibleTokenBalance) ||
      ({
        microchain,
        tokenId,
        balance: 0
      } as dbModel.MicrochainFungibleTokenBalance)
    microchainBalance.balance = Number(balance)
    if (microchainBalance.id === undefined) {
      await dbBridge.MicrochainFungibleTokenBalance.create(
        microchain,
        microchainBalance.tokenId,
        microchainBalance.balance
      )
    } else {
      await dbBridge.MicrochainFungibleTokenBalance.update(microchainBalance)
    }
  }

  static updateAccountBalance = async (
    microchain: string,
    tokenId: number,
    owner: string,
    balance: number
  ) => {
    const microchainOwnerBalance =
      ((await dbBridge.MicrochainOwnerFungibleTokenBalance.balance(
        microchain,
        owner,
        tokenId
      )) as dbModel.MicrochainOwnerFungibleTokenBalance) ||
      ({
        microchain,
        owner,
        tokenId,
        balance: 0
      } as dbModel.MicrochainOwnerFungibleTokenBalance)
    microchainOwnerBalance.balance = balance
    if (microchainOwnerBalance.id === undefined) {
      await dbBridge.MicrochainOwnerFungibleTokenBalance.create(
        microchain,
        owner,
        tokenId,
        microchainOwnerBalance.balance
      )
    } else {
      await dbBridge.MicrochainOwnerFungibleTokenBalance.update(
        microchainOwnerBalance
      )
    }
  }

  static updateNativeBalances = async (microchain: string) => {
    const owners = await dbBridge.MicrochainOwner.microchainOwners(microchain)
    if (!owners?.length) return

    const _owners = owners.reduce((keys: string[], a): string[] => {
      keys.push(a.owner)
      return keys
    }, [])

    const balances = await rpcBridge.Account.balances([
      {
        chainId: microchain,
        owners: Array.from(
          _owners.map((el) => rpcBridge.Account.accountOwner(el))
        )
      }
    ])
    if (!balances) return
    if (!balances[microchain]) return
    const nativeToken = (await dbBridge.Token.native()) as dbModel.Token
    if (!nativeToken) return
    await BalanceHelper.updateChainBalance(
      microchain,
      nativeToken.id as number,
      Number(balances[microchain].chainBalance)
    )
    for (const owner of _owners) {
      await BalanceHelper.updateAccountBalance(
        microchain,
        nativeToken.id as number,
        owner,
        Number(rpcBridge.Account.ownerBalance(balances, microchain, owner))
      )
    }
  }

  static updateMemeBalances = async (microchain: string) => {
    const tokens = await dbBridge.Token.tokens(0, 0, undefined, microchain)
    const microchains = await dbBridge.Microchain.microchains(0, 0)

    for (const token of tokens) {
      for (const microchain of microchains) {
        const owners = await dbBridge.MicrochainOwner.microchainOwners(
          microchain.microchain
        )
        // We should query all owners
        for (const owner of owners) {
          try {
            const balance =
              (await rpcBridge.MemeApplicationOperation.balanceOf(
                token.applicationId as string,
                microchain.microchain,
                owner.owner
              )) || 0
            await BalanceHelper.updateAccountBalance(
              microchain.microchain,
              token.id as number,
              owner.owner,
              balance
            )
          } catch (e) {
            console.log('Failed process account balance', e)
          }
        }
      }
    }
  }
}
