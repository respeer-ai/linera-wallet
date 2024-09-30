<template>
  <div class='full-width  full-height'>
    <div class='row page-actions-padding flex items-center justify-center'>
      <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer page-item-x-margin-left' @click='onBackClick' />
      <q-space />
      <div class='setting-label setting-label-dense text-grey-9 text-bold'>
        {{ title }}
      </div>
      <q-space />
      <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
      <div class='page-item-x-margin-left' />
    </div>
    <div class='vertical-menus-margin' v-if='step === 1'>
      <SidebarMenu @clicked='onMenuClicked' />
    </div>
    <div class='full-width vertical-menus-margin' v-if='step === 2'>
      <SettingInnerNarrowView ref='settingInnerView' @back='onInnerBack' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { localStore, settingDef } from 'src/localstores'

import SidebarMenu from './SidebarMenu.vue'
import SettingInnerNarrowView from './SettingInnerNarrowView.vue'

const step = ref(1)
const title = ref('Settings')

const settingInnerView = ref<InstanceType<typeof SettingInnerNarrowView>>()

const onBackClick = () => {
  if (step.value === 1) {
    localStore.setting.ShowSettingMenu = false
    return
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  settingInnerView.value?.back()
}

const onCloseClick = () => {
  localStore.setting.ShowSettingMenu = false
}

const onInnerBack = () => {
  step.value--
  if (step.value === 1) {
    title.value = 'Settings'
  }
}

const onMenuClicked = (menu: settingDef.MenuItem) => {
  title.value = menu.label
  step.value++
}

</script>
