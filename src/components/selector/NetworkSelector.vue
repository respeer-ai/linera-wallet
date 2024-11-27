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
  <RpcNetworkInfoBridge ref='rpcNetworkInfoBridge' />
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { db } from 'src/model'
import { localStore } from 'src/localstores'

import DbNetworkBridge from '../bridge/db/NetworkBridge.vue'
import RpcNetworkInfoBridge from '../bridge/rpc/NetworkInfoBridge.vue'

const networks = ref([] as db.Network[])

const networkBridge = ref<InstanceType<typeof DbNetworkBridge>>()
const rpcNetworkInfoBridge = ref<InstanceType<typeof RpcNetworkInfoBridge>>()

const network = defineModel<db.Network>()
const emit = defineEmits<{(ev: 'selected', value: db.Network): void,
  (ev: 'add'): void
}>()

const onDeleteNetworkClick = async (network: db.Network) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await (networkBridge.value)?.deleteNetwork(network.id as number)
}

const onNetworkSelected = async (_network: db.Network) => {
  _network.selected = true
  network.value = _network
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await networkBridge.value?.updateNetwork(_network)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  localStore.setting.NetworkInfo = await rpcNetworkInfoBridge.value?.getNetworkInfo()
  emit('selected', _network)
}

const onAddNetworkClick = () => {
  localStore.setting.ShowSettingMenu = true
  emit('add')
}

</script>
