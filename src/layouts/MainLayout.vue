<template>
  <q-layout view='hHh Lpr hff'>
    <q-header v-if='showHeaderMenu'>
      <q-toolbar class='text-white bg-white'>
        <HeaderMenu :style='{ width: "100%" }' />
      </q-toolbar>
    </q-header>
    <SidebarMenu v-if='showSideMenu' />
    <q-page-container>
      <q-page :class='[ extensionMode ? "popup-container" : "", "flex justify-center", alignPageCneter ? "items-center" : "" ]'>
        <router-view />
      </q-page>
    </q-page-container>
    <q-footer v-if='showFooterMenu' class='text-grey-8 bg-white' :style='{ margin: "6px 12px" }'>
      Another browser wallet for Linera blockchain by
      <a href='https://respeer.ai'>respeer.ai</a> <strong>MaaS</strong>
    </q-footer>
    <TestnetTip v-if='showTestTip' />
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { notify, oneshotsetting } from 'src/localstores'
import { useI18n } from 'vue-i18n'

import HeaderMenu from 'src/components/HeaderMenu.vue'
import SidebarMenu from 'src/components/SidebarMenu.vue'
import TestnetTip from 'src/components/TestnetTip.vue'

const notification = notify.useNotificationStore()
const setting = oneshotsetting.useSettingStore()
const showFooterMenu = computed(() => setting.showFooterMenu)
const showTestTip = computed(() => setting.showTestTip)
const showHeaderMenu = computed(() => setting.showHeaderMenu)
const showSideMenu = computed(() => setting.showSideMenu)
const extensionMode = computed(() => setting.extensionMode)
const alignPageCneter = computed(() => setting.alignPageCenter)

// eslint-disable-next-line @typescript-eslint/unbound-method
const { t } = useI18n({ useScope: 'global' })

onMounted(() => {
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

<style scoped lang="sass"></style>
