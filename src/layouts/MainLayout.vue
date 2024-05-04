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
import { wallet, notify } from 'src/localstores'
import { useI18n } from 'vue-i18n'

import HeaderMenu from 'src/components/HeaderMenu.vue'
import SidebarMenu from 'src/components/SidebarMenu.vue'

const _wallet = wallet.useWalletStore()
const notification = notify.useNotificationStore()

// eslint-disable-next-line @typescript-eslint/unbound-method
const { t } = useI18n({ useScope: 'global' })

onMounted(() => {
  _wallet.load()
  notification.$subscribe((_, state) => {
    state.Notifications.forEach((notif, index) => {
      if (notif.Popup) {
        state.Notifications.splice(index, 1)
        if (notif.Description) {
          notif.Description = t(notif.Description)
        }
        if (notif.Message) {
          notif.Message = t(notif.Message)
        }
        if (notif.Title) {
          notif.Title = t(notif.Title)
        }
        notify.notify(notif)
      }
    })
  })
})

</script>

<style scoped lang="sass">
</style>
