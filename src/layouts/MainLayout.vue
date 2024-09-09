<template>
  <q-layout view='hHh Lpr fFf'>
    <q-header v-if='showHeaderMenu'>
      <q-toolbar class='text-white bg-white'>
        <HeaderMenu :style='{ width: "100%" }' />
      </q-toolbar>
      <q-resize-observer @resize='onHeaderResize' />
    </q-header>
    <SidebarMenu v-if='showSideMenu' />
    <q-page-container>
      <q-page :class='[ "flex justify-center", alignPageCneter ? "items-center" : "" ]'>
        <router-view v-slot='{ Component }'>
          <transition
            enter-active-class='animated slideInRight' leave-active-class='animated slideOutLeft' mode='out-in'
            :duration='300'
          >
            <component
              :is='Component'
              :class='[ "popup-container flex justify-center", alignPageCneter ? "items-center" : "" ]'
              :style='{
                height: `calc(600px - ${headerHeight}px - ${footerHeight}px - (${outerHeight}px - ${innerHeight}px))`,
                width: "368px",
                overflow: "scroll"
              }'
            />
          </transition>
        </router-view>
      </q-page>
    </q-page-container>
    <q-footer v-if='showFooterMenu' class='text-grey-8 bg-grey-1'>
      <FooterMenu />
      <q-resize-observer @resize='onFooterResize' />
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import wasmModuleUrl from '../../src-bex/wasm/linera_wasm_bg.wasm?url'
import initWasm from '../../src-bex/wasm/linera_wasm'
import { Berith } from '@hazae41/berith'
import { localStore } from 'src/localstores'

import HeaderMenu from 'src/components/header/HeaderMenu.vue'
import FooterMenu from 'src/components/footer/FooterMenu.vue'
import SidebarMenu from 'src/components/SidebarMenu.vue'

const showFooterMenu = computed(() => localStore.oneShotSetting.showFooterMenu)
const showHeaderMenu = computed(() => localStore.oneShotSetting.showHeaderMenu)
const showSideMenu = computed(() => localStore.oneShotSetting.showSideMenu)
const alignPageCneter = computed(() => localStore.oneShotSetting.alignPageCenter)

// eslint-disable-next-line @typescript-eslint/unbound-method
const { t } = useI18n({ useScope: 'global' })

const handlerNotification = () => {
  localStore.notification.$subscribe((_, state) => {
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
        localStore.notify.notify(notif)
      }
    })
  })
}

onMounted(async () => {
  await initWasm(await fetch(wasmModuleUrl))
  await Berith.initBundledOnce()
  handlerNotification()
})

interface Size {
  width: number
  height: number
}

const headerHeight = ref(0)
const footerHeight = ref(0)
const outerHeight = ref(window.outerHeight)
const innerHeight = ref(window.innerHeight)

const onHeaderResize = (size: Size) => {
  headerHeight.value = size.height
}
const onFooterResize = (size: Size) => {
  footerHeight.value = size.height
}

</script>

<style scoped lang='sass'>
</style>
