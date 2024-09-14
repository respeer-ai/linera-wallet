<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div v-if='activities.length > 0'>
      <ActivityCardView v-for='activity in activities' :key='activity.id' :activity='activity' />
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
  <DbActivityBridge v-model:activities='activities' />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from 'src/model'

import DbActivityBridge from '../bridge/db/ActivityBridge.vue'
import ActivityCardView from './ActivityCardView.vue'

const activities = ref([] as db.Activity[])

</script>
