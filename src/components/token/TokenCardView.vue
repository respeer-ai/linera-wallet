<template>
  <q-item class='row full-width tab-panel-item' clickable>
    <div v-if='showIndicator' :class='[ "selector-indicator", (active || (activeNative && token.native)) ? "selector-indicator-selected" : "" ]' />
    <q-avatar :class='[ showIndicator ? "selector-margin-x-left" : "" ]'>
      <q-img :src='tokenLogo' />
      <q-badge
        v-if='!token.native' color='transparent' rounded transparent
        floating
      >
        <q-img :src='lineraLogo' width='14px' height='14px' />
      </q-badge>
    </q-avatar>
    <div class='selector-margin-x-left'>
      <div class='text-bold text-grey-9 row text-left'>
        {{ token.ticker }}
      </div>
    </div>
    <q-space />
    <div class='selector-margin-x-left'>
      <div class='text-bold text-grey-9 text-right'>
        {{ parseFloat(tokenBalance.toFixed(4)) }} <span class='selector-item-currency-sub'>{{ token.ticker }}</span>
      </div>
      <div class='text-right'>
        $ {{ parseFloat(usdBalance.toFixed(2)) }} <span class='text-grey-6 selector-item-currency-sub'>{{ $t('MSG_USD') }}</span>
      </div>
    </div>
    <div v-if='showIndicator' class='selector-indicator selector-margin-x-left' />
    <DbOwnerBalanceBridge v-model:token-balance='tokenBalance' v-model:usd-balance='usdBalance' :token-id='token.id' />
    <DbOwnerBridge ref='dbOwnerBridge' v-model:selected-owner='selectedOwner' />
  </q-item>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef, watch } from 'vue'

import DbOwnerBalanceBridge from '../bridge/db/OwnerBalanceBridge.vue'
import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'

import { lineraLogo } from 'src/assets'
import { dbBridge } from 'src/bridge'

interface Props {
  token: db.Token
  showIndicator?: boolean
  active?: boolean
  activeNative?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  showIndicator: true,
  active: false,
  activeNative: true
})
const token = toRef(props, 'token')
const showIndicator = toRef(props, 'showIndicator')
const active = toRef(props, 'active')
const activeNative = toRef(props, 'activeNative')

const tokenBalance = ref(0)
const usdBalance = ref(0)
const tokenLogo = ref('')

const selectedOwner = ref(undefined as unknown as db.Owner)

const getBalance = async () => {
  if (!selectedOwner.value) return
  const balance = await dbBridge.Owner.ownerBalance(selectedOwner.value, token.value.id as number)
  tokenBalance.value = balance?.tokenBalance
  usdBalance.value = balance?.usdBalance
}

watch(selectedOwner, async () => {
  await getBalance()
})

onMounted(async () => {
  await getBalance()
  tokenLogo.value = await dbBridge.Token.logo(token.value.id as number) as string
})

</script>
