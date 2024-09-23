<template>
  <q-layout view='hHh Lpr fFf'>
    <q-header v-if='showHeaderMenu'>
      <q-toolbar class='text-white bg-white'>
        <MainHeaderView :style='{ width: "100%" }' />
      </q-toolbar>
      <q-resize-observer @resize='onHeaderResize' />
    </q-header>
    <q-page-container>
      <q-page :class='[ "flex justify-center", alignPageCenter ? "items-center" : "" ]'>
        <router-view v-slot='{ Component }'>
          <transition
            enter-active-class='animated slideInRight' leave-active-class='animated slideOutLeft' mode='out-in'
            :duration='300'
          >
            <component
              :is='Component'
              :class='[ extensionMode ? "popup-container" : "page-container shadow-1 flex justify-center", alignPageCenter ? "items-center" : "" ]'
              :style='{
                height: bodyHeight,
                width: `${viewWidth} !important`,
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
    <BlockView />
    <StoreLoader />
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import wasmModuleUrl from '../../src-bex/wasm/linera_wasm_bg.wasm?url'
import initWasm from '../../src-bex/wasm/linera_wasm'
import { Berith } from '@hazae41/berith'
import { localStore } from 'src/localstores'

import MainHeaderView from 'src/components/header/MainHeaderView.vue'
import FooterMenu from 'src/components/footer/FooterMenu.vue'
import BlockView from 'src/components/block/BlockView.vue'
import StoreLoader from 'src/components/loader/StoreLoader.vue'

const showFooterMenu = computed(() => localStore.oneShotSetting.showFooterMenu)
const showHeaderMenu = computed(() => localStore.oneShotSetting.showHeaderMenu)
const alignPageCenter = computed(() => localStore.oneShotSetting.alignPageCenter)
const extensionMode = computed(() => localStore.oneShotSetting.extensionMode)
const showSettingMenu = computed(() => localStore.oneShotSetting.showSettingMenu)

watch(showSettingMenu, () => {
  localStore.oneShotSetting.oneShotSetting.ShowFooterMenu = showSettingMenu.value
})

const viewWidth = computed(() => extensionMode.value ? '368px' : '800px')
const viewHeight = computed(() => extensionMode.value ? '600px' : '100%')
const bodyHeight = computed(() => extensionMode.value ? '600px' : `calc(${viewHeight.value} - ${headerHeight.value}px - ${footerHeight.value}px - (${outerHeight.value}px - ${innerHeight.value}px))`)

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
