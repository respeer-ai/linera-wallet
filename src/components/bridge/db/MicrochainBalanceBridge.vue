<template>
  <TokenBridge v-model:tokens='tokens' />
</template>

<script setup lang='ts'>
import { dbModel } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import { computed, ref, toRef, watch } from 'vue'
import { dbBridge } from 'src/bridge'

import TokenBridge from './TokenBridge.vue'

interface Props {
  tokenId?: number
  microchainId?: string
}
const props = defineProps<Props>()
const tokenId = toRef(props, 'tokenId')
const microchainId = toRef(props, 'microchainId')

const tokens = ref([] as dbModel.Token[])

const tokenBalance = defineModel<number>('tokenBalance')
const usdBalance = defineModel<number>('usdBalance')

const _balances = useObservable<dbModel.MicrochainFungibleTokenBalance[]>(
  liveQuery(async () => {
    if (!microchainId.value) return []
    return tokenId.value !== undefined
      ? (await dbWallet.microchainFungibleTokenBalances.toArray()).filter((el) => el.tokenId === tokenId.value && el.microchain === microchainId.value)
      : await dbWallet.microchainFungibleTokenBalances.where('microchain').equals(microchainId.value).toArray()
  }) as never
)

const _tokenBalance = computed(() => {
  if (tokenId.value === undefined) return 0
  return _balances.value?.reduce((sum, a) => sum + a.balance, 0)
})

watch(_tokenBalance, () => {
  tokenBalance.value = _tokenBalance.value
})

const _usdBalance = computed(() => {
  return _balances.value?.reduce((sum, a) => sum + a.balance * (tokens.value.find((el) => el.id === a.tokenId)?.usdCurrency || 0), 0)
})

watch(_usdBalance, () => {
  usdBalance.value = _usdBalance.value
})

watch(microchainId, async () => {
  if (!microchainId.value || !tokenId.value) return
  tokenBalance.value = (await dbBridge.MicrochainFungibleTokenBalance.balance(microchainId.value, tokenId.value))?.balance || 0
  usdBalance.value = tokenBalance.value * ((await dbBridge.Token.tokenWithId(tokenId.value))?.usdCurrency || 0)
})

</script>
