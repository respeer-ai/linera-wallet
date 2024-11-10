<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div v-if='activities.length > 0'>
      <ActivityCardView v-for='activity in displayActivities' :key='activity.id' :activity='activity' :x-padding='xPadding' />
    </div>
    <div v-else class='page-item-placeholder'>
      <div>
        <q-icon name='bi-plus-circle' size='48px' color='grey-4' />
      </div>
      <div class='page-item-y-margin-top' v-html='$t("MSG_NEW_TO_LINERA_TRANSFER_TOKENS")' />
    </div>
    <q-space />
  </div>
  <DbActivityBridge v-model:activities='activities' />
</template>

<script setup lang="ts">
import { computed, ref, toRef } from 'vue'
import { db } from 'src/model'

import DbActivityBridge from '../bridge/db/ActivityBridge.vue'
import ActivityCardView from './ActivityCardView.vue'

interface Props {
  xPadding?: string
}
const props = defineProps<Props>()
const xPadding = toRef(props, 'xPadding')

const activities = ref([] as db.Activity[])
const displayActivities = computed(() => {
  return [...activities.value].sort((a, b) => b.timestamp - a.timestamp)
})

</script>
