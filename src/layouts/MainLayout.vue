<template>
  <q-layout view='lHh Lpr lFf'>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { wallet } from 'src/localstores'

const _wallet = wallet.useWalletStore()

onMounted(async () => {
  await _wallet.load()
})

</script>

<style scoped lang="sass">
</style>
