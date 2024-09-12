<template>
  <div class='row full-width page-header shadow-1'>
    <div class='page-header-left-right page-header-network-btn'>
      <q-btn-dropdown
        rounded flat filled class='btn-alt'
        no-caps dense
        dropdown-icon='bi-chevron-down'
        menu-anchor='bottom left'
        menu-self='top left'
        @click='onNetworkClick'
      >
        <template #label>
          <div class='row'>
            <q-img :src='selectedNetwork?.icon' width='20px' height='20px' />
            <div class='header-items-margin-x-left page-header-network'>
              {{ selectedNetwork?.name }}
            </div>
          </div>
        </template>
      </q-btn-dropdown>
    </div>
    <q-space />
    <div class='header-account text-center'>
      <div class='header-text text-center text-bold row cursor-pointer' @click='onAccountClick'>
        <q-space />
        <div class='account-icon'>
          <q-img v-if='selectedOwner' :src='db.ownerAvatar(selectedOwner)' height='14px' width='14px' />
        </div>
        <div class='header-items-margin-x-left'>
          {{ selectedOwner?.name }}
        </div>
        <div class='header-items-margin-x-left'>
          <q-icon name='bi-chevron-down' size='12px' />
        </div>
        <q-space />
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
      <q-icon class='header-icon cursor-pointer' name='bi-three-dots-vertical' size='12x'>
        <q-menu anchor='bottom end' self='top end' :offset='[0, 8]'>
          <q-card>
            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-icon name='bi-bell-fill' size='12px' />
              </q-item-section>
              <q-item-section>
                <span>Notifications</span>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-icon name='bi-person-bounding-box' size='12px' />
              </q-item-section>
              <q-item-section>
                <span>Account details</span>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-icon name='bi-box-arrow-up-right' size='12px' />
              </q-item-section>
              <q-item-section>
                <span>View on explorer</span>
              </q-item-section>
            </q-item>
            <q-separator />
            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-icon name='bi-box-arrow-in-right' size='12px' />
              </q-item-section>
              <q-item-section>
                <span>All permissions</span>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-icon name='bi-gear-fill' size='12px' />
              </q-item-section>
              <q-item-section>
                <span>Settings</span>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup>
              <q-item-section avatar>
                <q-icon name='bi-shield-lock-fill' size='12px' />
              </q-item-section>
              <q-item-section>
                <span>Lock wallet</span>
              </q-item-section>
            </q-item>
          </q-card>
        </q-menu>
      </q-icon>
    </div>
  </div>
  <NetworkBridge v-model:networks='networks' v-model:selected-network='selectedNetwork' />
  <OwnerBridge v-model:owners='owners' v-model:selected-owner='selectedOwner' />
  <q-dialog v-model='selectingNetwork'>
    <NetworkSelector v-model='selectedNetwork' @selected='onNetworkSelected' />
  </q-dialog>
  <q-dialog v-model='selectingOwner'>
    <OwnerSelector v-model='selectedOwner' @selected='onOwnerSelected' />
  </q-dialog>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { db } from 'src/model'
import { shortid } from 'src/utils'

import NetworkBridge from '../bridge/db/NetworkBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import NetworkSelector from '../selector/NetworkSelector.vue'
import OwnerSelector from '../selector/OwnerSelector.vue'

const networks = ref([] as db.Network[])
const selectedNetwork = ref(undefined as unknown as db.Network)
const owners = ref([] as db.Owner[])
const selectedOwner = ref(undefined as unknown as db.Owner)

const selectingNetwork = ref(false)
const selectingOwner = ref(false)

const onNetworkClick = () => {
  selectingNetwork.value = true
}

const onAccountClick = () => {
  selectingOwner.value = true
}

const onNetworkSelected = (network: db.Network) => {
  selectingNetwork.value = false
  selectedNetwork.value = network
}

const onOwnerSelected = (owner: db.Owner) => {
  selectingOwner.value = false
  selectedOwner.value = owner
}

</script>
