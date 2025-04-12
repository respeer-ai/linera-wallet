<template>
  <DbOwnerBridge ref='dbOwnerBridge' v-model:selected-owner='selectedOwner' />
</template>

<script setup lang='ts'>
import { dbWallet } from 'src/controller'
import { dbModel } from 'src/model'
import { onMounted, ref, toRef, watch } from 'vue'
import { dbBridge } from 'src/bridge'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

import DbOwnerBridge from './OwnerBridge.vue'

const selectedOwner = ref(undefined as unknown as dbModel.Owner)

interface Props {
  tokenId?: number
}
const props = defineProps<Props>()
const tokenId = toRef(props, 'tokenId')

const tokenBalance = defineModel<number>('tokenBalance')
const usdBalance = defineModel<number>('usdBalance')

const _tokenBalance = useObservable<number>(
  liveQuery(async () => {
    const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
    if (!owner) return 0
    return await dbBridge.OwnerBalance.getTokenBalance(owner, tokenId.value)
  }) as never
)

onMounted(async () => {
  const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
  if (!owner) return
  tokenBalance.value = await dbBridge.OwnerBalance.getTokenBalance(owner, tokenId.value)
  usdBalance.value = await dbBridge.OwnerBalance.getUsdBalance(owner, tokenId.value)
})

watch(selectedOwner, async () => {
  const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
  if (!owner) return
  tokenBalance.value = await dbBridge.OwnerBalance.getTokenBalance(owner, tokenId.value)
  usdBalance.value = await dbBridge.OwnerBalance.getUsdBalance(owner, tokenId.value)
})

watch(_tokenBalance, async () => {
  tokenBalance.value = _tokenBalance.value
  const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
  if (!owner) return
  usdBalance.value = await dbBridge.OwnerBalance.getUsdBalance(owner, tokenId.value)
})

</script>
