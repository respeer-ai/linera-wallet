<template>
  <div class='row full-width page-header shadow-1'>
    <div class='page-header-left-right page-header-network-btn'>
      <q-btn-dropdown
        rounded flat filled class='btn-alt'
        no-caps dense
        dropdown-icon='bi-chevron-down'
      >
        <template #label>
          <div class='row'>
            <q-img :src='selectedNetwork?.icon' width='20px' height='20px' />
            <div class='header-items-margin-x-left page-header-network'>
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
    <q-space />
    <div class='header-account text-center'>
      <div class='header-text text-center'>
        {{ selectedOwner?.name }}
      </div>
      <div class='header-text text-center'>
        {{ selectedOwner?.address }}
      </div>
    </div>
    <q-space />
    <div class='page-header-left-right row'>
      <q-space />
      <q-icon class='header-icon cursor-pointer' name='bi-three-dots-vertical' size='12x' />
    </div>
  </div>
  <NetworkBridge v-model:networks='networks' v-model:selected-network='selectedNetwork' />
  <OwnerBridge v-model:owners='owners' v-model:selected-owner='selectedOwner' />
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { Network, Owner } from 'src/model'

import NetworkBridge from '../bridge/NetworkBridge.vue'
import OwnerBridge from '../bridge/OwnerBridge.vue'

const networks = ref([] as Network[])
const selectedNetwork = ref(undefined as unknown as Network)
const owners = ref([] as Owner[])
const selectedOwner = ref(undefined as unknown as Owner)

</script>
