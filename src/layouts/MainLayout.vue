<template>
  <q-layout view='hHh Lpr hff'>
    <q-header v-if='showHeaderMenu'>
      <q-toolbar class='text-white bg-white'>
        <HeaderMenu v-if='!extensionMode' :style='{ width: "100%" }' />
        <ExtensionHeaderMenu v-else :style='{ width: "100%" }' />
      </q-toolbar>
      <q-resize-observer @resize='onHeaderResize' />
    </q-header>
    <SidebarMenu v-if='showSideMenu' />
    <q-page-container>
      <q-page
        :class='[ extensionMode ? "popup-container" : "", "flex justify-center", alignPageCneter ? "items-center" : "" ]'
        :style='{
          height: `calc(600px - ${headerHeight}px - ${footerHeight}px)`
        }'
      >
        <router-view />
      </q-page>
    </q-page-container>
    <q-footer v-if='showFooterMenu' class='text-grey-8 bg-white' :style='{ margin: "6px 12px" }'>
      <div>
        Another browser wallet for Linera blockchain by
        <a href='https://respeer.ai'>respeer.ai</a> <strong>MaaS</strong>
      </div>
      <q-resize-observer @resize='onFooterResize' />
    </q-footer>
    <div v-if='!extensionMode'>
      <TestnetTip />
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { notify, oneshotsetting } from 'src/localstores'
import { useI18n } from 'vue-i18n'

import HeaderMenu from 'src/components/HeaderMenu.vue'
import ExtensionHeaderMenu from 'src/components/extension/HeaderMenu.vue'
import SidebarMenu from 'src/components/SidebarMenu.vue'
import TestnetTip from 'src/components/TestnetTip.vue'

const notification = notify.useNotificationStore()
const setting = oneshotsetting.useSettingStore()
const showFooterMenu = computed(() => setting.showFooterMenu)
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

interface Size {
  width: number
  height: number
}

const headerHeight = ref(0)
const footerHeight = ref(0)

const onHeaderResize = (size: Size) => {
  headerHeight.value = size.height
}
const onFooterResize = (size: Size) => {
  footerHeight.value = size.height
}

</script>

<style scoped lang="sass"></style>
