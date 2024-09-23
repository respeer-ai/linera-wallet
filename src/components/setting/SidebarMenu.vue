<template>
  <div :class='[ "sidebar extra-large-margin-bottom", localStore.oneShotSetting.extensionMode ? "full-width" : "" ]'>
    <div v-if='!localStore.oneShotSetting.extensionMode' class='setting-label text-grey-9 text-bold'>
      Settings
    </div>
    <q-tabs
      vertical no-caps inline-label v-model='localStore.oneShotSetting.oneShotSetting.SelectedSettingMenu'
      indicator-color='red-6'
    >
      <div v-for='menu in localStore.oneShotSettingDef.SettingMenus' :key='menu.menu'>
        <q-tab
          :name='menu.menu'
          v-ripple
          :class='[ localStore.oneShotSetting.selectedSettingMenu === menu.menu ? "bg-red-1" : "" ]'
          :disable='menu.disable'
          @click='onTabClick(menu.menu)'
        >
          <q-item-section avatar>
            <q-icon :name='menu.icon' :color='menu.iconColor || ""' />
          </q-item-section>
          <q-item-section>
            {{ menu.label }}
          </q-item-section>
          <q-item-section v-if='localStore.oneShotSetting.extensionMode'>
            <div class='row'>
              <q-space />
              <q-icon name='bi-chevron-right' />
            </div>
          </q-item-section>
        </q-tab>
        <q-separator v-if='menu.separator' />
      </div>
    </q-tabs>
  </div>
</template>

<script setup lang='ts'>
import { localStore, oneShotSettingDef } from 'src/localstores'

const emit = defineEmits<{(ev: 'clicked', value: oneShotSettingDef.Menu): void}>()

const onTabClick = (menu: oneShotSettingDef.Menu) => {
  emit('clicked', menu)
}

</script>

<style scoped lang='sass'>
::v-deep .q-tab__content
  width: 100% !important
  padding-left: 4px
  .q-item__section
    text-align: left
</style>
