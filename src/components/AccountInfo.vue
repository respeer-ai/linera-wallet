<template>
  <div>
    <div :style='{fontSize: "28px", fontWeight: "600"}' class='text-brown-8 text-center'>
      {{ accountBalance.toFixed(4) }} TLINERA
    </div>
    <div class='row'>
      <q-space />
      <q-btn
        flat
        dense
        label='Transer'
        :style='{
          width: "240px",
          borderRadius: "16px",
          margin: "8px 0 0 0",
          height: "28px"
        }'
        class='text-brown-10 bg-red-1'
        @click='onTransferClick'
      />
      <q-space />
      <div :style='{marginTop: "48px", width: "100%"}'>
        <ExtensionMicrochains />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { wallet } from 'src/localstores'

import ExtensionMicrochains from './extension/Microchains.vue'

const _wallet = wallet.useWalletStore()

const accountBalance = computed(() => _wallet.accountBalance(undefined, undefined))

const onTransferClick = () => {
  // TODO
}
</script>
