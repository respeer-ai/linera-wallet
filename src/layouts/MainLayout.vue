<template>
  <q-layout view='hHh Lpr hff'>
    <q-header>
      <q-toolbar class='text-white bg-white'>
        <HeaderMenu :style='{width: "100%"}' />
      </q-toolbar>
    </q-header>
    <SidebarMenu />
    <q-page-container>
      <router-view />
    </q-page-container>
    <q-footer class='text-grey-8 bg-white' :style='{margin: "6px 12px"}'>
      Another browser wallet for Linera blockchain by
      <a href='https://respeer.ai'>respeer.ai</a> <strong>MaaS</strong>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { wallet } from 'src/localstores'

import HeaderMenu from 'src/components/HeaderMenu.vue'
import SidebarMenu from 'src/components/SidebarMenu.vue'

const _wallet = wallet.useWalletStore()

onMounted(() => {
  _wallet.load()
})

</script>

<style scoped lang="sass">
</style>
