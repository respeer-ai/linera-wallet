<template>
  <div :style='{padding: "24px"}'>
    <div :style='{fontSize: "28px", fontWeight: "600"}' class='text-brown-8 text-center'>
      {{ accountBalance.toFixed(4) }} TLINERA
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { wallet } from 'src/localstores'

const _wallet = wallet.useWalletStore()

const accountBalance = computed(() => _wallet.accountBalance(undefined, undefined))
</script>
