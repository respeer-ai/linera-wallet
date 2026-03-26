<template>
  <div class='full-width full-height'>
    <div class='row items-center setting-header network-setting-header'>
      <div class='flex items-center justify-center network-setting-header__icon'>
        <q-icon name='bi-plugin' size='16px' />
      </div>
      <div class='page-item-x-margin-left network-setting-header__title'>
        {{ $t('MSG_NETWORKS') }}
      </div>
      <q-space />
      <q-btn
        dense flat class='network-setting-header__action' no-caps
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
          <div class='row items-center no-wrap setting-item network-setting-item'>
            <div class='setting-item setting-icon network-setting-indicator'>
              <q-icon v-if='network.selected' name='bi-check' size='28px' color='green-4' />
            </div>
            <q-avatar size='28px' color='grey-4' class='page-item-x-margin-left network-setting-avatar'>
              <q-img :src='network.icon' width='24px' height='24px' />
            </q-avatar>
            <div :class='[ "page-item-x-margin-left text-grey-9 word-break-all network-setting-name", network.id === displayNetwork?.id ? "text-bold" : "" ]'>
              {{ network.name }}
            </div>
            <q-icon
              v-if='network.preset' name='bi-key-fill' size='28px' color='grey-4'
              class='page-item-x-margin-left network-setting-preset'
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
import { dbModel } from 'src/model'

import NetworkBridge from '../bridge/db/NetworkBridge.vue'
import NetworkEditorView from './NetworkEditorView.vue'

const networks = ref([] as dbModel.Network[])
const selectedNetwork = ref({} as dbModel.Network)

const displayNetwork = ref(selectedNetwork.value)

watch(selectedNetwork, () => {
  displayNetwork.value = selectedNetwork.value
})

const addingNetwork = ref(false)
const addedNetwork = ref({} as dbModel.Network)

const onAddNetworkClick = () => {
  addingNetwork.value = !addingNetwork.value
}

const onNetworkSaved = () => {
  addingNetwork.value = false
}

const onNetworkDeleted = () => {
  addingNetwork.value = false
}

const onNetworkSelected = (network: dbModel.Network) => {
  displayNetwork.value = network
}

</script>

<style scoped lang='sass'>
.network-setting-item
  min-height: 40px

.network-setting-header
  min-height: 44px

.network-setting-header__icon
  width: 20px
  min-width: 20px

.network-setting-header__title
  display: flex
  align-items: center
  min-height: 20px

.network-setting-header__action
  min-height: 36px
  padding: 0 14px
  color: #445a75
  background: rgba(255, 255, 255, 0.96)
  border: 1px solid rgba(3, 118, 201, 0.18)
  border-radius: 12px
  box-shadow: none

.network-setting-indicator
  width: 28px
  min-width: 28px
  display: flex
  align-items: center
  justify-content: center

.network-setting-avatar
  flex: 0 0 auto

.network-setting-name
  flex: 1
  min-width: 0
  line-height: 1.35

.network-setting-preset
  flex: 0 0 auto
</style>
