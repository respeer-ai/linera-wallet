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
      <div class='header-text text-center text-bold row cursor-pointer'>
        <q-space />
        <div class='account-icon'>
          <q-img v-if='selectedOwner' :src='ownerAvatar(selectedOwner)' height='14px' width='14px' />
        </div>
        <div class='header-items-margin-x-left'>
          {{ selectedOwner?.name }}
        </div>
        <div class='header-items-margin-x-left'>
          <q-icon name='bi-chevron-down' size='12px' />
        </div>
        <q-space />
        <q-menu>
          <q-list class='page-header-selector'>
            <q-item v-for='owner in owners' :key='owner.id' clickable v-close-popup>
              <q-avatar>
                <q-img :src='ownerAvatar(owner)' height='48px' width='48px' />
              </q-avatar>
              <div class='header-items-margin-x-left'>
                {{ owner.name }}
              </div>
            </q-item>
          </q-list>
        </q-menu>
      </div>
      <div class='header-text text-center row cursor-pointer'>
        <q-space />
        <div>
          0x{{ shortid.shortId(selectedOwner?.address, 4) }}
        </div>
        <div class='header-items-margin-x-left cursor-pointer'>
          <q-icon name='bi-copy' size='12px' />
        </div>
        <q-space />
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
import { Network, Owner, ownerAvatar } from 'src/model'

import NetworkBridge from '../bridge/NetworkBridge.vue'
import OwnerBridge from '../bridge/OwnerBridge.vue'
import { shortid } from 'src/utils'

const networks = ref([] as Network[])
const selectedNetwork = ref(undefined as unknown as Network)
const owners = ref([] as Owner[])
const selectedOwner = ref(undefined as unknown as Owner)

</script>
