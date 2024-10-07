<template>
  <q-item class='row full-width tab-panel-item' clickable>
    <div :class='[ "selector-indicator", token.native ? "selector-indicator-selected" : "" ]' />
    <q-avatar class='selector-margin-x-left'>
      <q-img :src='token.icon' />
      <q-badge
        v-if='!token.native' color='transparent' rounded transparent
        floating
      >
        <q-img :src='lineraLogo' width='14px' height='14px' />
      </q-badge>
    </q-avatar>
    <div class='selector-margin-x-left'>
      <div class='text-bold text-grey-9 row'>
        {{ token.name }}
      </div>
    </div>
    <q-space />
    <div>
      <div class='text-bold text-grey-9 text-right'>
        {{ tokenBalance }} <span class='selector-item-currency-sub'>{{ token.ticker }}</span>
      </div>
      <div class='text-right'>
        $ {{ usdBalance }} <span class='text-grey-6 selector-item-currency-sub'>USD</span>
      </div>
    </div>
    <div :class='[ "selector-indicator selector-margin-x-left" ]' />
    <DbOwnerBalanceBridge v-model:token-balance='tokenBalance' v-model:usd-balance='usdBalance' :token-id='token.id' />
    <DbOwnerBridge ref='dbOwnerBridge' v-model:selected-owner='selectedOwner' />
    <DbTokenBridge ref='dbTokenBridge' />
  </q-item>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef, watch } from 'vue'

import DbOwnerBalanceBridge from '../bridge/db/OwnerBalanceBridge.vue'
import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'
import DbTokenBridge from '../bridge/db/TokenBridge.vue'

import { lineraLogo } from 'src/assets'

interface Props {
  token: db.Token
}
const props = defineProps<Props>()
const token = toRef(props, 'token')

const tokenBalance = ref(0)
const usdBalance = ref(0)

const selectedOwner = ref(undefined as unknown as db.Owner)

const dbTokenBridge = ref<InstanceType<typeof DbTokenBridge>>()
const dbOwnerBridge = ref<InstanceType<typeof DbOwnerBridge>>()

const getBalance = async () => {
  if (!selectedOwner.value) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const nativeTokenId = (await dbTokenBridge.value?.nativeToken())?.id || 0
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const balance = await dbOwnerBridge.value?.ownerBalance(selectedOwner.value, nativeTokenId)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  tokenBalance.value = balance?.tokenBalance || 0
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  usdBalance.value = balance?.usdBalance || 0
}

watch(selectedOwner, async () => {
  await getBalance()
})

onMounted(async () => {
  await getBalance()
})

</script>
