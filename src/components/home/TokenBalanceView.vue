<template>
  <div class='page-padding full-width text-center home-token-balance'>
    <div>
      {{ usdBalance.toFixed(4) }} TLINERA
    </div>
    <div class='row home-token-action text-center page-y-padding'>
      <q-space />
      <div class='home-token-action-btn cursor-pointer'>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-currency-exchange' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          Exchange
        </div>
      </div>
      <div class='home-token-action-btn cursor-pointer'>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-arrow-up-right' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          Transfer
        </div>
      </div>
      <div class='home-token-action-btn cursor-pointer'>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-arrow-repeat' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          Swap
        </div>
      </div>
      <div class='home-token-action-btn cursor-pointer'>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-arrow-left-right' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          Bridge
        </div>
      </div>
      <div class='home-token-action-btn cursor-pointer'>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-clock' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          Stake
        </div>
      </div>
      <q-space />
    </div>
    <OwnerBalanceBridge v-model:usd-balance='usdBalance' />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

import OwnerBalanceBridge from '../bridge/db/OwnerBalanceBridge.vue'

const usdBalance = ref(0)

</script>
