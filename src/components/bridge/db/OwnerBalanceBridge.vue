<script setup lang='ts'>
import { dbBase, dbWallet } from 'src/controller'
import { onMounted, toRef } from 'vue'

interface Props {
  tokenId?: number
}
const props = defineProps<Props>()
const tokenId = toRef(props, 'tokenId')

const tokenBalance = defineModel<number>('tokenBalance')
const usdBalance = defineModel<number>('usdBalance')

onMounted(async () => {
  const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
  if (!owner) return
  const microchainOwners = (await dbWallet.microchainOwners.toArray()).filter((el) => el.owner === owner.owner)
  const microchains = microchainOwners.reduce<string[]>((microchainIds: string[], a) => { microchainIds.push(a.microchain); return microchainIds }, [])

  const microchainFungibleTokenBalances = (await dbWallet.microchainFungibleTokenBalances.where('microchain').anyOf(microchains).toArray()).filter((el) => {
    return tokenId.value !== undefined ? tokenId.value === el.tokenId : true
  })
  const microchainOwnerFungibleTokenBalances = (await dbWallet.microchainOwnerFungibleTokenBalances.where('owner').equals(owner.owner).toArray()).filter((el) => {
    return tokenId.value !== undefined ? tokenId.value === el.tokenId : true
  })

  const tokenIds = microchainFungibleTokenBalances.reduce<number[]>((ids: number[], a) => { ids.push(a.tokenId); return ids }, [])
  tokenIds.concat(...microchainOwnerFungibleTokenBalances.reduce<number[]>((ids: number[], a) => { ids.push(a.tokenId); return ids }, []))
  const tokens = await dbBase.tokens.where('id').anyOf(tokenIds).toArray()

  tokenBalance.value = tokenId.value === undefined
    ? 0
    : microchainOwnerFungibleTokenBalances.reduce((sum, a) => sum + Number(a.balance || 0), 0) +
      microchainFungibleTokenBalances.reduce((sum, a) => sum + Number(a.balance || 0), 0)
  usdBalance.value = microchainOwnerFungibleTokenBalances.reduce((sum, a) => sum + Number(a.balance || 0) * (tokens.find((el) => el.id === a.tokenId)?.usdCurrency || 0), 0) +
                     microchainFungibleTokenBalances.reduce((sum, a) => sum + Number(a.balance || 0) * (tokens.find((el) => el.id === a.tokenId)?.usdCurrency || 0), 0)
})

</script>
