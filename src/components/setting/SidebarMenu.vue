<template>
  <div :class='[ "sidebar extra-large-margin-bottom", localStore.setting.extensionMode ? "full-width" : "" ]'>
    <div v-if='!localStore.setting.extensionMode' class='setting-label text-grey-9 text-bold'>
      {{ $t('MSG_SETTINGS') }}
    </div>
    <q-tabs
      vertical no-caps inline-label v-model='localStore.setting.SelectedSettingMenu'
      indicator-color='red-6'
    >
      <div v-for='(menu, i) in menus' :key='menu.menu'>
        <q-tab
          :name='menu.menu'
          v-ripple
          :class='[ localStore.setting.selectedSettingMenu === menu.menu ? "bg-red-1" : "" ]'
          :disable='menu.disable'
          @click='onTabClick(menu)'
        >
          <q-item-section avatar>
            <q-img v-if='isImg(menu)' :src='menuIcon(menu)' width='24px' height='24px' />
            <q-icon v-else :name='menu.icon' :color='menu.iconColor || ""' />
          </q-item-section>
          <q-item-section>
            {{ menu.label }}
          </q-item-section>
          <q-item-section v-if='localStore.setting.extensionMode'>
            <div class='row'>
              <q-space />
              <q-icon name='bi-chevron-right' />
            </div>
          </q-item-section>
        </q-tab>
        <q-separator v-if='menu.separator && i < menus.length - 1' />
      </div>
    </q-tabs>
  </div>
</template>

<script setup lang='ts'>
import { localStore, settingDef } from 'src/localstores'
import { computed } from 'vue'

import { applicationManagementLogo, blobGatewayLogo, lineraLogo, lineraSwapLogo } from 'src/assets'

const emit = defineEmits<{(ev: 'clicked', value: settingDef.MenuItem): void}>()

const onTabClick = (menu: settingDef.MenuItem) => {
  emit('clicked', menu)
}

const menus = computed(() => localStore.settingDef.SettingMenus.filter((el) => !el.hide))

const menuIcon = (menu: settingDef.MenuItem) => {
  switch (menu.menu) {
    case settingDef.Menu.SWAP: return lineraSwapLogo
    case settingDef.Menu.BLOB_GATEWAY: return blobGatewayLogo
    case settingDef.Menu.AMS: return applicationManagementLogo
    case settingDef.Menu.GENESIS: return lineraLogo
    default: return menu.icon
  }
}

const isImg = (menu: settingDef.MenuItem) => {
  return menu.menu === settingDef.Menu.SWAP ||
         menu.menu === settingDef.Menu.BLOB_GATEWAY ||
         menu.menu === settingDef.Menu.AMS ||
         menu.menu === settingDef.Menu.GENESIS
}

</script>

<style scoped lang='sass'>
::v-deep .q-tab__content
  width: 100% !important
  padding-left: 4px
  .q-item__section
    text-align: left
</style>
