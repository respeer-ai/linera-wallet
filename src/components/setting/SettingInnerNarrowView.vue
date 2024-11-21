<template>
  <q-tab-panels v-model='localStore.setting.SelectedSettingMenu' animated>
    <q-tab-panel :name='localStore.settingDef.Menu.NETWORKS'>
      <NetworkSettingNarrowView ref='networkSettingView' @back='onBack' />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.SWAP'>
      <SwapSettingView />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.WLINERA'>
      <WLineraSettingView />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.ABOUT_US'>
      <AboutUsView />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.STORAGE'>
      <StorageOperationView />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.ACCOUNTS'>
      <AccountsView ref='accountsView' @back='onBack' />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.ADDRESSES_BOOK'>
      <AddressesBook />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { ref } from 'vue'

import NetworkSettingNarrowView from './NetworkSettingNarrowView.vue'
import AboutUsView from './AboutUsView.vue'
import StorageOperationView from './StorageOperationView.vue'
import AccountsView from './AccountsView.vue'
import AddressesBook from './AddressesBook.vue'
import SwapSettingView from './SwapSettingView.vue'
import WLineraSettingView from './WLineraSettingView.vue'

const accountsView = ref<InstanceType<typeof AccountsView>>()
const networkSettingView = ref<InstanceType<typeof NetworkSettingNarrowView>>()

const back = () => {
  switch (localStore.setting.selectedSettingMenu) {
    case localStore.settingDef.Menu.ACCOUNTS:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      return accountsView.value?.back()
    case localStore.settingDef.Menu.NETWORKS:
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      return networkSettingView.value?.back()
    default:
      return emit('back')
  }
}

defineExpose({
  back
})

const emit = defineEmits<{(ev: 'back'): void}>()

const onBack = () => {
  emit('back')
}

</script>
