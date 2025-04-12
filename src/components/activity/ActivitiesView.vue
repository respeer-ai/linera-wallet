<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div v-if='activities.length > 0'>
      <div v-for='activity in displayActivities' :key='activity.id' @click='onActivityClick(activity)'>
        <ActivityCardView :activity='activity' :x-padding='xPadding' />
      </div>
      <q-btn
        rounded flat no-caps class='full-width bg-grey-1'
        @click='onViewMoreClick'
        v-if='displayCount < activities.length'
        color='grey-6'
        :label='$t("MSG_VIEW_MORE_THREE_DOTS")'
      />
    </div>
    <div v-else class='page-item-placeholder'>
      <div>
        <q-icon name='bi-plus-circle' size='48px' color='grey-4' />
      </div>
      <div class='page-item-y-margin-top' v-html='$t("MSG_NEW_TO_LINERA_TRANSFER_TOKENS")' />
    </div>
    <q-space />
  </div>
  <DbOwnerBridge v-model:selected-owner='selectedOwner' />
  <DbActivityBridge ref='dbActivityBridge' />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { dbModel } from 'src/model'
import { localStore } from 'src/localstores'

import DbActivityBridge from '../bridge/db/ActivityBridge.vue'
import ActivityCardView from './ActivityCardView.vue'
import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'
import { dbBridge } from 'src/bridge'

interface Props {
  xPadding?: string
}
const props = defineProps<Props>()
const xPadding = toRef(props, 'xPadding')

const selectedOwner = ref(undefined as unknown as dbModel.Owner)

const dbActivityBridge = ref<InstanceType<typeof DbActivityBridge>>()

const activities = ref([] as dbModel.Activity[])
const displayCount = ref(5)

const displayActivities = computed(() => {
  return [...activities.value].sort((a, b) => b.timestamp - a.timestamp).slice(0, displayCount.value)
})

const loadActivitiesRecursive = async (total: number, offset: number, limit: number, _activities: dbModel.Activity[]) => {
  if (offset >= total) {
    activities.value = _activities
    return
  }
  _activities.push(...await dbBridge.Activity.ownerActivities(offset, limit, selectedOwner.value))
  void loadActivitiesRecursive(total, offset + limit, limit, _activities)
}

const loadActivities = async () => {
  if (!selectedOwner.value) return
  activities.value = []
  const count = await dbBridge.Activity.count()
  await loadActivitiesRecursive(count, 0, 10, [])
}

onMounted(() => {
  void loadActivities()
})

watch(selectedOwner, () => {
  void loadActivities()
})

const onActivityClick = (activity: dbModel.Activity) => {
  localStore.setting.HomeAction = localStore.settingDef.HomeAction.SHOW_ACTIVITY
  localStore.setting.HomeActionParams = activity
}

const onViewMoreClick = () => {
  displayCount.value += 4
  displayCount.value = Math.min(displayCount.value, activities.value.length)
}

</script>
