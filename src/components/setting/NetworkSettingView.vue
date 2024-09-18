<template>
  <div class='full-width full-height'>
    <div class='row setting-header'>
      <div>Networks</div>
      <q-space />
      <q-btn dense flat class='btn' no-caps>
        Add network
      </q-btn>
    </div>
    <q-separator class='vertical-items-margin' />
    <div class='row full-width extra-large-margin-bottom'>
      <div class='right-border half-width page-y-padding'>
        <div v-for='network in networks' :key='network.id' class='setting-item-container cursor-pointer'>
          <div class='row setting-item'>
            <div class='setting-item setting-icon'>
              <q-icon v-if='network.selected' name='bi-check' size='28px' color='green-4' />
            </div>
            <q-avatar size='28px' color='grey-4' class='page-item-x-margin-left'>
              <q-img :src='network.icon' width='24px' height='24px' />
            </q-avatar>
            <div class='page-item-x-margin-left'>
              {{ network.name }}
            </div>
            <q-icon
              v-if='network.preset' name='bi-key-fill' size='28px' color='grey-4'
              class='page-item-x-margin-left'
            />
          </div>
        </div>
      </div>
      <div class='half-width page-x-padding page-y-padding'>
        <div class='text-bold'>
          Network name
        </div>
        <div class='page-item-y-margin-top'>
          <q-input dense outlined v-model='selectedNetwork.name' :disable='selectedNetwork.preset' />
        </div>
        <div class='text-bold page-item-y-margin-top'>
          Faucet URL
        </div>
        <div class='page-item-y-margin-top'>
          <q-input dense outlined v-model='selectedNetwork.faucetUrl' :disable='selectedNetwork.preset' />
        </div>
        <div class='text-bold page-item-y-margin-top'>
          RPC URL
        </div>
        <div class='page-item-y-margin-top'>
          <q-input dense outlined v-model='rpcUrl' :disable='selectedNetwork.preset' />
        </div>
        <div v-if='!selectedNetwork.preset' class='vertical-sections-margin'>
          <q-btn dense flat class='btn full-width' no-caps>
            Save
          </q-btn>
          <q-btn dense flat class='btn btn-alt full-width vertical-items-margin' no-caps>
            Delete
          </q-btn>
        </div>
      </div>
    </div>
    <NetworkBridge ref='networkBridge' v-model:networks='networks' v-model:selected-network='selectedNetwork' />
  </div>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'
import { db } from 'src/model'

import NetworkBridge from '../bridge/db/NetworkBridge.vue'

const networks = ref([] as db.Network[])
const selectedNetwork = ref({} as db.Network)

const rpcUrl = computed({
  get: () => db.rpcUrl(selectedNetwork.value),
  set: (v: URL) => {
    selectedNetwork.value.host = v.host
    selectedNetwork.value.port = parseInt(v.port)
    selectedNetwork.value.path = v.pathname
  }
})

/*
const networkBridge = ref<InstanceType<typeof NetworkBridge>>()

const onDeleteNetworkClick = async (network: db.Network) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await (networkBridge.value)?.deleteNetwork(network.id as number)
}

const onNetworkSelected = async (_network: db.Network) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await networkBridge.value?.updateNetwork(_network)
}
  */

</script>
