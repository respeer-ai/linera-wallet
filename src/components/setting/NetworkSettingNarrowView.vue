<template>
  <div class='full-width full-height'>
    <div v-if='step === 1'>
      <div v-for='network in networks' :key='network.id' class='setting-item-container cursor-pointer setting-item-no-x-padding' @click='onNetworkSelected(network)'>
        <div class='row setting-item setting-item-inner-padding'>
          <div class='setting-item setting-icon'>
            <q-icon v-if='network.selected' name='bi-check' size='28px' color='green-4' />
          </div>
          <q-avatar size='28px' color='grey-4' class='page-item-x-margin-left'>
            <q-img :src='network.icon' width='24px' height='24px' />
          </q-avatar>
          <div :class='[ "page-item-x-margin-left text-grey-9", network.id === displayNetwork?.id ? "text-bold" : "" ]'>
            {{ network.name }}
          </div>
          <q-icon
            v-if='network.preset' name='bi-key-fill' size='28px' color='grey-4'
            class='page-item-x-margin-left'
          />
        </div>
      </div>
      <div class='page-x-padding'>
        <q-btn
          flat class='btn full-width vertical-sections-margin' no-caps
          @click='onAddNetworkClick'
        >
          {{ $t('MSG_ADD_NETWORK') }}
        </q-btn>
      </div>
    </div>
    <div v-if='step === 2' class='full-width extra-margin-bottom'>
      <div v-if='addingNetwork' class='full-width page-y-padding'>
        <NetworkEditorView v-model='addedNetwork' @saved='onNetworkSaved' @deleted='onNetworkDeleted' />
      </div>
      <div v-else class='full-width page-y-padding'>
        <NetworkEditorView v-model='displayNetwork' @saved='onNetworkSaved' @deleted='onNetworkDeleted' />
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

const step = ref(1)

const emit = defineEmits<{(ev: 'back'): void}>()

watch(selectedNetwork, () => {
  displayNetwork.value = selectedNetwork.value
})

const addingNetwork = ref(false)
const addedNetwork = ref({} as db.Network)

const onAddNetworkClick = () => {
  addingNetwork.value = true
  step.value++
}

const onNetworkSaved = () => {
  addingNetwork.value = false
}

const onNetworkDeleted = () => {
  addingNetwork.value = false
}

const onNetworkSelected = (network: db.Network) => {
  displayNetwork.value = network
  step.value++
}

const back = () => {
  if (step.value === 1) {
    return emit('back')
  }
  step.value--
}

defineExpose({
  back
})

</script>
