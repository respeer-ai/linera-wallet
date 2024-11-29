<template>
  <DbOwnerBridge ref='dbOwnerBridge' v-model:selected-owner='selectedOwner' />
</template>

<script setup lang='ts'>
import { dbWallet } from 'src/controller'
import { db } from 'src/model'
import { onMounted, ref, toRef, watch } from 'vue'
import { dbBridge } from 'src/bridge'

import DbOwnerBridge from './OwnerBridge.vue'

const selectedOwner = ref(undefined as unknown as db.Owner)

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
  tokenBalance.value = await dbBridge.OwnerBalance.getTokenBalance(owner, tokenId.value)
  usdBalance.value = await dbBridge.OwnerBalance.getUsdBalance(owner, tokenId.value)
})

watch(selectedOwner, async () => {
  const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
  if (!owner) return
  tokenBalance.value = await dbBridge.OwnerBalance.getTokenBalance(owner, tokenId.value)
  usdBalance.value = await dbBridge.OwnerBalance.getUsdBalance(owner, tokenId.value)
})

</script>
