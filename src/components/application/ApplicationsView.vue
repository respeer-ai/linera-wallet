<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div v-if='microchains.length > 0'>
      <ApplicationCardView v-for='microchain in microchains' :key='microchain.microchain' :microchain='microchain' />
    </div>
    <div v-else>
      No usable application? <span class='cursor-pointer like-link'>Create</span> or <span class='cursor-pointer like-link'>Import</span>.
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
import ApplicationCardView from './ApplicationCardView.vue'

const microchainOwners = ref([] as MicrochainOwner[])
const microchains = ref([] as Microchain[])

</script>
