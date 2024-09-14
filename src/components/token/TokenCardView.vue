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
    <OwnerBalanceBridge v-model:token-balance='tokenBalance' v-model:usd-balance='usdBalance' :token-id='token.id' />
  </q-item>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { ref, toRef } from 'vue'

import OwnerBalanceBridge from '../bridge/db/OwnerBalanceBridge.vue'

import { lineraLogo } from 'src/assets'

interface Props {
  token: db.Token
}
const props = defineProps<Props>()
const token = toRef(props, 'token')

const tokenBalance = ref(0)
const usdBalance = ref(0)

</script>
