<template>
  <q-card class='selector-card'>
    <p class='text-center text-bold text-grey-9 selector-title'>
      {{ $t('MSG_SELECT_A_NETWORK') }}
    </p>
    <q-list class='selector-list'>
      <q-item
        v-for='_network in networks' :key='_network.id' clickable
        :class='[ "selector-item-padding-right tab-panel-item", _network.selected ? "selector-item-selected" : "" ]'
        @click='onNetworkSelected(_network)'
      >
        <div :class='[ "selector-indicator", _network.selected ? "selector-indicator-selected" : "" ]' />
        <q-avatar color='red-1 selector-margin-x-left'>
          <q-img :src='_network.icon' width='48px' height='48px' />
        </q-avatar>
        <div class='selector-margin-x-left'>
          <div class='text-bold text-grey-9'>
            {{ _network.name }}
          </div>
          <div class='selector-item-endpoint'>
            {{ _network.faucetUrl }}
          </div>
        </div>
        <q-space />
        <div v-if='!_network.preset && !_network.selected' class='selector-delete-btn'>
          <q-icon name='bi-trash3' size='16px' @click='onDeleteNetworkClick(_network)' />
        </div>
      </q-item>
    </q-list>
    <div class='selector-action'>
      <q-btn
        flat class='btn btn-alt full-width' :label='$t("MSG_ADD_NETWORK")' no-caps
        @click='onAddNetworkClick'
      />
    </div>
  </q-card>
  <DbNetworkBridge ref='networkBridge' v-model:networks='networks' />
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { dbModel } from 'src/model'
import { localStore } from 'src/localstores'
import { dbBridge, rpcBridge } from 'src/bridge'

import DbNetworkBridge from '../bridge/db/NetworkBridge.vue'

const networks = ref([] as dbModel.Network[])

const network = defineModel<dbModel.Network>()
const emit = defineEmits<{(ev: 'selected', value: dbModel.Network): void,
  (ev: 'add'): void
}>()

const onDeleteNetworkClick = async (network: dbModel.Network) => {
  await dbBridge.Network.delete(network.id as number)
}

const onNetworkSelected = async (_network: dbModel.Network) => {
  _network.selected = true
  network.value = _network
  await dbBridge.Network.update(_network)
  localStore.setting.NetworkInfo = await rpcBridge.GenesisInfo.getNetworkInfo()
  emit('selected', _network)
}

const onAddNetworkClick = () => {
  localStore.setting.ShowSettingMenu = true
  emit('add')
}

</script>
