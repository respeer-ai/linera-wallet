<template>
  <q-tab-panels v-model='localStore.oneShotSetting.oneShotSetting.SelectedSettingMenu' animated>
    <q-tab-panel :name='localStore.oneShotSettingDef.Menu.NETWORKS'>
      <NetworkSettingView />
    </q-tab-panel>
    <q-tab-panel :name='localStore.oneShotSettingDef.Menu.ABOUT_US'>
      <AboutUsView />
    </q-tab-panel>
    <q-tab-panel :name='localStore.oneShotSettingDef.Menu.STORAGE'>
      <StorageOperationView />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'

import NetworkSettingView from './NetworkSettingView.vue'
import AboutUsView from './AboutUsView.vue'
import StorageOperationView from './StorageOperationView.vue'

</script>
