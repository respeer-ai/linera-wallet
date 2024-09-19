<template>
  <div class='page-padding full-width text-center home-tabs'>
    <q-tabs v-model='tab' no-caps indicator-color='grey-9' dense>
      <q-tab name='microchains'>
        Microchains
      </q-tab>
      <q-tab name='tokens'>
        Tokens
      </q-tab>
      <q-tab name='applications'>
        Applications
      </q-tab>
      <q-tab name='activities'>
        Activities
      </q-tab>
    </q-tabs>
    <q-tab-panels v-model='tab' swipeable animated>
      <q-tab-panel name='tokens'>
        <TokensView />
      </q-tab-panel>
      <q-tab-panel name='microchains'>
        <MicrochainsView />
      </q-tab-panel>
      <q-tab-panel name='applications'>
        <ApplicationsView />
      </q-tab-panel>
      <q-tab-panel name='activities'>
        <ActivitiesView />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

import TokensView from '../token/TokensView.vue'
import MicrochainsView from '../microchain/MicrochainsView.vue'
import ApplicationsView from '../application/ApplicationsView.vue'
import ActivitiesView from '../activity/ActivitiesView.vue'

const tab = ref('microchains')

</script>
