<template>
  <q-card class='selector-card'>
    <p class='text-center text-bold text-grey-9 selector-title'>
      Select a network
    </p>
    <q-list class='selector-list'>
      <q-item
        v-for='network in networks' :key='network.id' clickable
        :class='[ "selector-item selector-item", network.selected ? "selector-item-selected" : "" ]'
      >
        <div :class='[ "selector-indicator", network.selected ? "selector-indicator-selected" : "" ]' />
        <q-avatar color='red-1 selector-margin-x-left'>
          <q-img :src='network.icon' width='48px' height='48px' />
        </q-avatar>
        <div class='selector-margin-x-left'>
          <div class='text-bold text-grey-9'>
            {{ network.name }}
          </div>
          <div class='selector-item-endpoint'>
            {{ network.faucetUrl }}
          </div>
        </div>
        <q-space />
        <div v-if='!network.preset' class='selector-delete-btn'>
          <q-icon name='bi-trash3' size='16px' @click='onDeleteNetworkClick(network)' />
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

const onDeleteNetworkClick = async (network: Network) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await (networkBridge.value)?.deleteNetwork(network.id as number)
}

</script>
