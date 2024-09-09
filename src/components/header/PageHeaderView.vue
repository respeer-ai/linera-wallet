<template>
  <div class='row page-header page-header-selector'>
    <q-btn-dropdown
      rounded flat filled class='shadow-1'
      no-caps dense
      dropdown-icon='bi-chevron-down'
    >
      <template #label>
        <div class='row'>
          <q-img :src='selectedNetwork?.icon' width='24px' height='24px' />
          <div class='header-items-margin-x-left'>
            {{ selectedNetwork?.name }}
          </div>
        </div>
      </template>
      <q-list class='page-header-selector'>
        <q-item v-for='network in networks' :key='network.id' clickable v-close-popup>
          <q-img :src='network.icon' width='24px' height='24px' />
          <div class='header-items-margin-x-left'>
            {{ network.name }}
          </div>
        </q-item>
      </q-list>
    </q-btn-dropdown>
  </div>
  <NetworkBridge v-model:networks='networks' v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { Network } from 'src/model'

import NetworkBridge from '../bridge/NetworkBridge.vue'

const networks = ref([] as Network[])
const selectedNetwork = ref(undefined as unknown as Network)

</script>
