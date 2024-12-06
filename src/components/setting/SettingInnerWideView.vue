<template>
  <q-tab-panels v-model='localStore.setting.SelectedSettingMenu' animated>
    <q-tab-panel :name='localStore.settingDef.Menu.NETWORKS'>
      <NetworkSettingWideView />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.GENESIS'>
      <GenesisInfoView />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.SWAP'>
      <SwapSettingView />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.WLINERA'>
      <WLineraSettingView />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.BLOB_GATEWAY'>
      <BlobGatewaySetting />
    </q-tab-panel>
    <q-tab-panel :name='localStore.settingDef.Menu.AMS'>
      <AMSSettingView />
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
    <q-tab-panel :name='localStore.settingDef.Menu.ENGINEERING'>
      <EngineeringView />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { ref } from 'vue'

import NetworkSettingWideView from './NetworkSettingWideView.vue'
import AboutUsView from './AboutUsView.vue'
import StorageOperationView from './StorageOperationView.vue'
import AccountsView from './AccountsView.vue'
import AddressesBook from './AddressesBook.vue'
import EngineeringView from './EngineeringView.vue'
import SwapSettingView from './SwapSettingView.vue'
import WLineraSettingView from './WLineraSettingView.vue'
import GenesisInfoView from './GenesisInfoView.vue'
import AMSSettingView from './AMSSettingView.vue'
import BlobGatewaySetting from './BlobGatewaySetting.vue'

const accountsView = ref<InstanceType<typeof AccountsView>>()

const back = () => {
  if (localStore.settingDef.Menu.ACCOUNTS !== localStore.setting.selectedSettingMenu) {
    return emit('back')
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  accountsView.value?.back()
}

defineExpose({
  back
})

const emit = defineEmits<{(ev: 'back'): void}>()

const onBack = () => {
  emit('back')
}

</script>
