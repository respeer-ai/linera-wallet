<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div v-if='microchains.length > 0'>
      <ActivityCardView v-for='microchain in microchains' :key='microchain.microchain' :microchain='microchain' />
    </div>
    <div v-else class='page-item-placeholder'>
      <div>
        <q-icon name='bi-plus-circle' size='48px' color='grey-4' />
      </div>
      <div class='page-item-y-margin-top'>
        New to Linera? <span class='cursor-pointer like-link'>Transfer</span> tokens.
      </div>
    </div>
    <q-space />
  </div>
  <MicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
  <MicrochainBridge v-model:microchains='microchains' />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from 'src/model'

import MicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import MicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import ActivityCardView from './ActivityCardView.vue'

const microchainOwners = ref([] as db.MicrochainOwner[])
const microchains = ref([] as db.Microchain[])

</script>
