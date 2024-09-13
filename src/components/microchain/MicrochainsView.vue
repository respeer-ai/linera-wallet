<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div>
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
      <div class='row vertical-sections-margin selector-margin-x-left cursor-pointer' @click='onCreateMicrochainClick'>
        <q-icon name='bi-plus' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold'>
          Create microchain
        </div>
      </div>
      <div class='row vertical-items-margin selector-margin-x-left cursor-pointer' @click='onImportMicrochainClick'>
        <q-icon name='bi-plus' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold'>
          Import microchain
        </div>
      </div>
    </div>
    <q-space />
  </div>
  <DbMicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
  <DbMicrochainBridge v-model:microchains='microchains' />
  <OpenChain ref='openChain' />
  <q-dialog v-model='creatingMicrochain'>
    <q-card class='dialog'>
      <h5 class='onboarding-page-title text-center page-title'>
        Create microchain
      </h5>
      <CreateMicrochainView @created='onMicrochainCreated' @error='onCreateMicrochainError' />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from 'src/model'

import DbMicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import MicrochainCardView from './MicrochainCardView.vue'
import OpenChain from './OpenChain.vue'
import CreateMicrochainView from './CreateMicrochainView.vue'

const microchainOwners = ref([] as db.MicrochainOwner[])
const microchains = ref([] as db.Microchain[])

const creatingMicrochain = ref(false)
const openChain = ref<InstanceType<typeof OpenChain>>()

const onMicrochainCreated = () => {
  creatingMicrochain.value = false
}

const onCreateMicrochainError = () => {
  creatingMicrochain.value = false
}

const onCreateMicrochainClick = () => {
  creatingMicrochain.value = true
}

const onImportMicrochainClick = () => {
  // TODO
}

</script>
