<template>
  <div>{{ addresses }}</div>
</template>

<script setup lang='ts'>
import { computed, onMounted } from 'vue'
import { wallet } from 'src/localstores'

const _wallet = wallet.useWalletStore()
const addresses = computed(() => _wallet.publicKeys)

onMounted(() => {
  _wallet.load()
})

</script>
