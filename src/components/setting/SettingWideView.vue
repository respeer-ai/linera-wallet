<template>
  <div class='row full-width  full-height'>
    <div>
      <SidebarMenu />
      <q-resize-observer @resize='onSidebarResize' />
    </div>
    <div :style='{width: `calc(100% - ${sidebarWidth}px - 32px)`, marginLeft: "16px"}'>
      <div class='row page-actions-padding'>
        <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer' @click='onBackClick' />
        <q-space />
        <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
      </div>
      <div class='vertical-menus-margin'>
        <SettingInnerWideView ref='settingInnerView' @back='onInnerBack' />
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { localStore } from 'src/localstores'

import SidebarMenu from './SidebarMenu.vue'
import SettingInnerWideView from './SettingInnerWideView.vue'

interface Size {
  width: number
  height: number
}

const sidebarWidth = ref(0)
const settingInnerView = ref<InstanceType<typeof SettingInnerWideView>>()

const onSidebarResize = (size: Size) => {
  sidebarWidth.value = size.width
}

const onBackClick = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  settingInnerView.value?.back()
}

const onCloseClick = () => {
  localStore.oneShotSetting.oneShotSetting.ShowSettingMenu = false
}

const onInnerBack = () => {
  localStore.oneShotSetting.oneShotSetting.ShowSettingMenu = false
}

</script>
