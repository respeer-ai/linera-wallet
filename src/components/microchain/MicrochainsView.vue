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
        No usable microchain? <span class='cursor-pointer like-link'>Create</span> or <span class='cursor-pointer like-link'>Import</span>.
      </div>
    </div>
    <q-space />
  </div>
  <MicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
  <MicrochainBridge v-model:microchains='microchains' />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Microchain, MicrochainOwner } from 'src/model'

import MicrochainOwnerBridge from '../bridge/MicrochainOwnerBridge.vue'
import MicrochainBridge from '../bridge/MicrochainBridge.vue'
import MicrochainCardView from './MicrochainCardView.vue'

const microchainOwners = ref([] as MicrochainOwner[])
const microchains = ref([] as Microchain[])

const onCreateMicrochainClick = () => {
  // TODO
}

</script>
