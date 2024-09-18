<template>
  <div class='row full-width  full-height'>
    <div>
      <SidebarMenu />
      <q-resize-observer @resize='onSidebarResize' />
    </div>
    <div class='selector-margin-x-left' :style='{width: `calc(100% - ${sidebarWidth}px - 32px)`}'>
      <div class='row page-actions-padding'>
        <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer' />
        <q-space />
        <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
      </div>
      <SettingInnerView />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { localStore } from 'src/localstores'

import SidebarMenu from './SidebarMenu.vue'
import SettingInnerView from './SettingInnerView.vue'

interface Size {
  width: number
  height: number
}

const sidebarWidth = ref(0)

const onSidebarResize = (size: Size) => {
  sidebarWidth.value = size.width
}

const onCloseClick = () => {
  localStore.oneShotSetting.oneShotSetting.ShowSettingMenu = false
}

</script>
