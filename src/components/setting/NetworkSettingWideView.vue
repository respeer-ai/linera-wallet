<template>
  <div class='full-width full-height'>
    <div class='row setting-header'>
      <div class='flex items-center justify-center'>
        <q-icon name='bi-plugin' size='16px' />
      </div>
      <div class='page-item-x-margin-left'>
        {{ $t('MSG_NETWORKS') }}
      </div>
      <q-space />
      <q-btn
        dense flat class='btn' no-caps
        @click='onAddNetworkClick'
      >
        {{ addingNetwork ? 'Cancel' : 'Add network' }}
      </q-btn>
    </div>
    <q-separator class='vertical-items-margin' />
    <div class='row full-width extra-large-margin-bottom'>
      <div v-if='addingNetwork' class='full-width page-y-padding'>
        <NetworkEditorView v-model='addedNetwork' @saved='onNetworkSaved' @deleted='onNetworkDeleted' />
      </div>
      <div v-else class='right-border network-list-left page-y-padding'>
        <NetworkEditorView v-model='displayNetwork' @saved='onNetworkSaved' @deleted='onNetworkDeleted' />
      </div>
      <div v-if='!addingNetwork' class='network-list-right'>
        <div v-for='network in networks' :key='network.id' class='setting-item-container cursor-pointer' @click='onNetworkSelected(network)'>
          <div class='row setting-item'>
            <div class='setting-item setting-icon'>
              <q-icon v-if='network.selected' name='bi-check' size='28px' color='green-4' />
            </div>
            <q-avatar size='28px' color='grey-4' class='page-item-x-margin-left'>
              <q-img :src='network.icon' width='24px' height='24px' />
            </q-avatar>
            <div :class='[ "page-item-x-margin-left text-grey-9 word-break-all", network.id === displayNetwork?.id ? "text-bold" : "" ]' :style='{maxWidth: "calc(100% - 28px - 28px - 28px - 18px)"}'>
              {{ network.name }}
            </div>
            <q-icon
              v-if='network.preset' name='bi-key-fill' size='28px' color='grey-4'
              class='page-item-x-margin-left'
            />
          </div>
        </div>
      </div>
    </div>
    <NetworkBridge ref='networkBridge' v-model:networks='networks' v-model:selected-network='selectedNetwork' />
  </div>
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'
import { db } from 'src/model'

import NetworkBridge from '../bridge/db/NetworkBridge.vue'
import NetworkEditorView from './NetworkEditorView.vue'

const networks = ref([] as db.Network[])
const selectedNetwork = ref({} as db.Network)

const displayNetwork = ref(selectedNetwork.value)

watch(selectedNetwork, () => {
  displayNetwork.value = selectedNetwork.value
})

const addingNetwork = ref(false)
const addedNetwork = ref({} as db.Network)

const onAddNetworkClick = () => {
  addingNetwork.value = !addingNetwork.value
}

const onNetworkSaved = () => {
  addingNetwork.value = false
}

const onNetworkDeleted = () => {
  addingNetwork.value = false
}

const onNetworkSelected = (network: db.Network) => {
  displayNetwork.value = network
}

</script>
