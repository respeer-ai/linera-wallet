<script setup lang='ts'>
import { dbBase, dbWallet } from 'src/controller'
import { db } from 'src/model'
import { onMounted, toRef } from 'vue'

interface Props {
  tokenId?: number
}
const props = defineProps<Props>()
const tokenId = toRef(props, 'tokenId')

const tokenBalance = defineModel<number>('tokenBalance')
const usdBalance = defineModel<number>('usdBalance')

const getTokenBalance = async (owner?: db.Owner, tokenId?: number) => {
  owner = owner || (await dbWallet.owners.toArray()).find((el) => el.selected)
  if (!owner) return

  let tokenBalance = 0

  const microchainOwners = (await dbWallet.microchainOwners.toArray()).filter((el) => el.owner === owner?.owner)
  const microchains = microchainOwners.reduce<string[]>((microchainIds: string[], a) => { microchainIds.push(a.microchain); return microchainIds }, [])

  const microchainFungibleTokenBalances = (await dbWallet.microchainFungibleTokenBalances.where('microchain').anyOf(microchains).toArray()).filter((el) => {
    return tokenId !== undefined ? tokenId === el.tokenId : true
  })
  const microchainOwnerFungibleTokenBalances = (await dbWallet.microchainOwnerFungibleTokenBalances.where('owner').equals(owner?.owner).toArray()).filter((el) => {
    return tokenId !== undefined ? tokenId === el.tokenId : true
  })

  const tokenIds = microchainFungibleTokenBalances.reduce<number[]>((ids: number[], a) => { ids.push(a.tokenId); return ids }, [])
  tokenIds.concat(...microchainOwnerFungibleTokenBalances.reduce<number[]>((ids: number[], a) => { ids.push(a.tokenId); return ids }, []))
  const tokens = await dbBase.tokens.where('id').anyOf(tokenIds).toArray()

  tokenBalance = tokenId === undefined
    ? 0
    : microchainOwnerFungibleTokenBalances.reduce((sum, a) => sum + Number(a.balance || 0), 0) +
      microchainFungibleTokenBalances.reduce((sum, a) => sum + Number(a.balance || 0), 0)
  usdBalance.value = microchainOwnerFungibleTokenBalances.reduce((sum, a) => sum + Number(a.balance || 0) * (tokens.find((el) => el.id === a.tokenId)?.usdCurrency || 0), 0) +
                     microchainFungibleTokenBalances.reduce((sum, a) => sum + Number(a.balance || 0) * (tokens.find((el) => el.id === a.tokenId)?.usdCurrency || 0), 0)

  return tokenBalance
}

const getUsdBalance = async (owner?: db.Owner, tokenId?: number) => {
  owner = owner || (await dbWallet.owners.toArray()).find((el) => el.selected)
  if (!owner) return

  let usdBalance = 0

  const microchainOwners = (await dbWallet.microchainOwners.toArray()).filter((el) => el.owner === owner?.owner)
  const microchains = microchainOwners.reduce<string[]>((microchainIds: string[], a) => { microchainIds.push(a.microchain); return microchainIds }, [])

  const microchainFungibleTokenBalances = (await dbWallet.microchainFungibleTokenBalances.where('microchain').anyOf(microchains).toArray()).filter((el) => {
    return tokenId !== undefined ? tokenId === el.tokenId : true
  })
  const microchainOwnerFungibleTokenBalances = (await dbWallet.microchainOwnerFungibleTokenBalances.where('owner').equals(owner?.owner).toArray()).filter((el) => {
    return tokenId !== undefined ? tokenId === el.tokenId : true
  })

  const tokenIds = microchainFungibleTokenBalances.reduce<number[]>((ids: number[], a) => { ids.push(a.tokenId); return ids }, [])
  tokenIds.concat(...microchainOwnerFungibleTokenBalances.reduce<number[]>((ids: number[], a) => { ids.push(a.tokenId); return ids }, []))
  const tokens = await dbBase.tokens.where('id').anyOf(tokenIds).toArray()

  usdBalance = microchainOwnerFungibleTokenBalances.reduce((sum, a) => sum + Number(a.balance || 0) * (tokens.find((el) => el.id === a.tokenId)?.usdCurrency || 0), 0) +
                     microchainFungibleTokenBalances.reduce((sum, a) => sum + Number(a.balance || 0) * (tokens.find((el) => el.id === a.tokenId)?.usdCurrency || 0), 0)

  return usdBalance
}

onMounted(async () => {
  const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
  if (!owner) return
  tokenBalance.value = await getTokenBalance(owner, tokenId.value)
  usdBalance.value = await getUsdBalance(owner, tokenId.value)
})

defineExpose({
  getTokenBalance,
  getUsdBalance
})

</script>
