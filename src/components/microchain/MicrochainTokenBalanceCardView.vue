<template>
  <q-item class='row full-width tab-panel-item' :style='{ paddingLeft: xPadding, paddingRight: xPadding }'>
    <div v-if='showIndicator' :class='[ "selector-indicator", (active || (activeNative && token.native)) ? "selector-indicator-selected" : "" ]' />
    <q-avatar :class='[ showIndicator ? "selector-margin-x-left" : "" ]'>
      <q-img :src='tokenLogo' width='36px' height='36px' fit='contain' />
      <q-badge
        v-if='!token.native' color='transparent' rounded transparent
        floating
      >
        <q-img :src='lineraLogo' width='14px' height='14px' />
      </q-badge>
    </q-avatar>
    <div class='selector-margin-x-left'>
      <div class='text-bold text-grey-9 text-left'>
        {{ token.ticker }}
      </div>
      <div class='text-grey-6 text-left'>
        {{ token.name }}
      </div>
    </div>
    <q-space />
    <div class='selector-margin-x-left'>
      <div class='text-bold text-grey-9 text-right'>
        {{ parseFloat(ownerTokenBalance.toFixed(4)) }} <span class='selector-item-currency-sub'>{{ token.ticker }}</span>
      </div>
      <div class='text-right'>
        $ {{ parseFloat(ownerUsdBalance.toFixed(2)) }} <span class='text-grey-6 selector-item-currency-sub'>{{ $t('MSG_USD') }}</span>
      </div>
    </div>
    <div v-if='showIndicator' class='selector-indicator selector-margin-x-left' />
    <DbOwnerBridge ref='dbOwnerBridge' v-model:selected-owner='selectedOwner' />
  </q-item>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef, watch } from 'vue'
import { dbBridge } from 'src/bridge'

import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'

import { lineraLogo } from 'src/assets'

interface Props {
  token: db.Token
  showIndicator?: boolean
  active?: boolean
  activeNative?: boolean
  microchain: db.Microchain
  xPadding?: string
}
const props = withDefaults(defineProps<Props>(), {
  showIndicator: true,
  active: false,
  activeNative: true,
  xPadding: '0'
})
const token = toRef(props, 'token')
const showIndicator = toRef(props, 'showIndicator')
const active = toRef(props, 'active')
const activeNative = toRef(props, 'activeNative')
const microchain = toRef(props, 'microchain')
const xPadding = toRef(props, 'xPadding')

const ownerTokenBalance = ref(0)
const ownerUsdBalance = ref(0)
const tokenLogo = ref('')

const selectedOwner = ref(undefined as unknown as db.Owner)

const getBalance = async () => {
  if (!selectedOwner.value) return
  ownerTokenBalance.value = (await dbBridge.MicrochainOwnerFungibleTokenBalance.balance(microchain.value.microchain, selectedOwner.value?.owner, token.value.id as number))?.balance || 0
  ownerUsdBalance.value = ownerTokenBalance.value * token.value.usdCurrency || 0
}

watch(selectedOwner, async () => {
  await getBalance()
})

onMounted(async () => {
  await getBalance()
  tokenLogo.value = await dbBridge.Token.logo(token.value.id as number) as string
})

</script>
