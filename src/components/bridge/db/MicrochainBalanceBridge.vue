<template>
  <TokenBridge v-model:tokens='tokens' />
</template>

<script setup lang='ts'>
import { db } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'
import { computed, ref, toRef, watch } from 'vue'

import TokenBridge from './TokenBridge.vue'

interface Props {
  tokenId?: number
  microchainId?: string
}
const props = defineProps<Props>()
const tokenId = toRef(props, 'tokenId')
const microchainId = toRef(props, 'microchainId')

const tokens = ref([] as db.Token[])

const tokenBalance = defineModel<number>('tokenBalance')
const usdBalance = defineModel<number>('usdBalance')

const _balances = useObservable<db.MicrochainFungibleTokenBalance[]>(
  from(
    liveQuery(async () => {
      if (!microchainId.value) return []
      return tokenId.value !== undefined
        ? await dbWallet.microchainFungibleTokenBalances.where(['tokenId', 'microchain']).equals([tokenId.value, microchainId.value]).toArray()
        : await dbWallet.microchainFungibleTokenBalances.where('microchain').equals(microchainId.value).toArray()
    })
  )
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

const createMicrochainFungibleTokenBalance = async (microchain: db.Microchain, tokenId: number, balance: number) => {
  await dbWallet.microchainFungibleTokenBalances.add({
    microchain: microchain.microchain,
    tokenId,
    balance
  })
}

const updateMicrochainFungibleTokenBalance = async (balance: db.MicrochainFungibleTokenBalance) => {
  await dbWallet.microchainFungibleTokenBalances.update(balance.id, balance)
}

const microchainFungibleTokenBalance = async (microchain: db.Microchain, tokenId: number): Promise<db.MicrochainFungibleTokenBalance | undefined> => {
  return (await dbWallet.microchainFungibleTokenBalances.toArray()).find((el) => el.microchain === microchain.microchain && el.tokenId === tokenId)
}

defineExpose({
  createMicrochainFungibleTokenBalance,
  microchainFungibleTokenBalance,
  updateMicrochainFungibleTokenBalance
})

</script>
