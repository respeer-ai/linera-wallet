<template>
  <q-card class='selector-card'>
    <p class='text-center text-bold text-grey-9 selector-title'>
      Select a network
    </p>
    <q-list class='selector-list'>
      <q-item
        v-for='_network in networks' :key='_network.id' clickable
        :class='[ "selector-item selector-item", _network.selected ? "selector-item-selected" : "" ]'
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
        <div v-if='!_network.preset' class='selector-delete-btn'>
          <q-icon name='bi-trash3' size='16px' @click='onDeleteNetworkClick(_network)' />
        </div>
      </q-item>
    </q-list>
    <div class='selector-action'>
      <q-btn flat class='btn btn-alt' label='Add network' no-caps />
    </div>
  </q-card>
  <NetworkBridge ref='networkBridge' v-model:networks='networks' />
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { Network } from 'src/model'

import NetworkBridge from '../bridge/NetworkBridge.vue'

const networks = ref([] as Network[])

const networkBridge = ref<InstanceType<typeof NetworkBridge>>()

const network = defineModel<Network>()
const emit = defineEmits<{(ev: 'selected', value: Network): void}>()

const onDeleteNetworkClick = async (network: Network) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await (networkBridge.value)?.deleteNetwork(network.id as number)
}

const onNetworkSelected = async (_network: Network) => {
  _network.selected = true
  network.value = _network
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await networkBridge.value?.updateNetwork(_network)
  emit('selected', _network)
}

</script>
