<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div v-if='microchains.length > 0'>
      <MicrochainCardView v-for='microchain in microchains' :key='microchain.microchain' :microchain='microchain' />
    </div>
    <div v-else class='page-item-placeholder'>
      <div class='cursor-pointer' @click='onCreateMicrochainClick'>
        <q-icon name='bi-plus-circle' size='48px' color='grey-4' />
      </div>
      <div class='page-item-y-margin-top'>
        No usable microchain?
        <span class='cursor-pointer like-link' @click='onCreateMicrochainClick'>Create</span> or
        <span class='cursor-pointer like-link' @click='onImportMicrochainClick'>Import</span>.
      </div>
    </div>
    <q-space />
  </div>
  <MicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
  <MicrochainBridge v-model:microchains='microchains' />
  <q-dialog v-model='creatingMicrochain'>
    <q-card>HHHHHHHHHHH</q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from 'src/model'

import MicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import MicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import MicrochainCardView from './MicrochainCardView.vue'

const microchainOwners = ref([] as db.MicrochainOwner[])
const microchains = ref([] as db.Microchain[])

const creatingMicrochain = ref(false)

const onCreateMicrochainClick = () => {
  creatingMicrochain.value = true
}

const onImportMicrochainClick = () => {
  // TODO
}

</script>
