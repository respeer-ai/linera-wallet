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
    <q-tab-panel :name='localStore.oneShotSettingDef.Menu.ACCOUNTS'>
      <AccountsView ref='accountsView' @back='onBack' />
    </q-tab-panel>
    <q-tab-panel :name='localStore.oneShotSettingDef.Menu.ADDRESSES_BOOK'>
      <AddressesBook />
    </q-tab-panel>
  </q-tab-panels>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { ref } from 'vue'

import NetworkSettingView from './NetworkSettingView.vue'
import AboutUsView from './AboutUsView.vue'
import StorageOperationView from './StorageOperationView.vue'
import AccountsView from './AccountsView.vue'
import AddressesBook from './AddressesBook.vue'

const accountsView = ref<InstanceType<typeof AccountsView>>()

const back = () => {
  if (localStore.oneShotSettingDef.Menu.ACCOUNTS !== localStore.oneShotSetting.selectedSettingMenu) {
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
