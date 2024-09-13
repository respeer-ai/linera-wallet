<template>
  <q-item class='row full-width tab-panel-item' clickable>
    <div :class='[ "selector-indicator", microchain.default ? "selector-indicator-selected" : "" ]' />
    <q-avatar class='selector-margin-x-left'>
      <q-img :src='db.microchainAvatar(microchain)' />
      <q-badge color='transparent' rounded transparent floating>
        <q-img :src='lineraLogo' width='14px' height='14px' />
      </q-badge>
    </q-avatar>
    <div class='selector-margin-x-left'>
      <div class='text-bold text-grey-9 row'>
        <div>
          0x{{ shortid.shortId(microchain.microchain, 5) }}
        </div>
        <div class='page-item-x-margin-left cursor-pointer'>
          <q-icon name='bi-copy' size='12px' />
        </div>
      </div>
      <div class='text-left'>
        {{ chainOwnerBalance }} <span class='text-grey-6 selector-item-currency-sub'>TLINERA</span>
      </div>
    </div>
    <q-space />
    <div>
      <div class='text-bold text-grey-9 text-right'>
        0 <span class='selector-item-currency-sub'>TLINERA</span>
      </div>
      <div class='text-right'>
        $ 0 <span class='text-grey-6 selector-item-currency-sub'>USD</span>
      </div>
    </div>
    <div :class='[ "selector-indicator selector-margin-x-left" ]' />
  </q-item>
  <MicrochainOwnerBridge v-model:microchain-owners='microchainOwners' :microchain='microchain.microchain' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, ref, toRef } from 'vue'
import { shortid } from 'src/utils'

import MicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'

import { lineraLogo } from 'src/assets'

interface Props {
  microchain: db.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

const microchainOwners = ref([] as db.MicrochainOwner[])
const chainOwnerBalance = computed(() => microchainOwners.value.reduce((sum) => sum + 0, 0))

</script>
