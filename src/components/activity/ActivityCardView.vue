<template>
  <q-item class='row full-width tab-panel-item' clickable :style='{ paddingLeft: xPadding, paddingRight: xPadding }'>
    <q-avatar size='28px'>
      <q-icon name='bi-box-arrow-in-right' size='24px' />
    </q-avatar>
    <div class='selector-margin-x-left row' :style='{width: "calc(100% - 28px - 12px)"}'>
      <div>
        <div class='text-bold text-left'>
          {{ action }}
        </div>
        <div class='text-grey-9 row'>
          <div>
            0x{{ shortid.shortId(address, 8) }}
          </div>
          <div class='page-item-x-margin-left cursor-pointer'>
            <q-icon name='bi-copy' size='12px' />
          </div>
        </div>
      </div>
      <q-space />
      <div class='header-items-margin-x-right'>
        <q-icon :name='direction' color='blue-8' />
        {{ Number(activity.amount) }} TLINERA
      </div>
    </div>
  </q-item>
  <OwnerBridge v-model:selected-owner='owner' />
  <MicrochainOwnerBridge :owner='owner?.owner' v-model:microchain-owners='microchainOwners' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { shortid } from 'src/utils'
import { computed, ref, toRef } from 'vue'

import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'

interface Props {
  activity: db.Activity
  xPadding?: string
}
const props = defineProps<Props>()
const activity = toRef(props, 'activity')
const xPadding = toRef(props, 'xPadding')

const owner = ref(undefined as unknown as db.Owner)
const microchainOwners = ref([] as db.MicrochainOwner[])

const action = computed(() => {
  if (owner.value?.owner === activity.value.sourceAddress ||
    microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0) {
    return 'Send'
  }
  if (owner.value?.owner === activity.value.targetAddress ||
    microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return 'Receive'
  }
  return 'Unknown'
})

const address = computed(() => {
  if (owner.value?.owner === activity.value.sourceAddress) {
    return activity.value.targetAddress || activity.value.targetChain
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0) {
    return activity.value.targetAddress || activity.value.targetChain
  }
  if (owner.value?.owner === activity.value.targetAddress) {
    return activity.value.sourceAddress || activity.value.sourceChain
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return activity.value.sourceAddress || activity.value.sourceChain
  }
  return 'Unknown'
})

const direction = computed(() => {
  if (owner.value?.owner === activity.value.sourceAddress) {
    return 'bi-dash-lg'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0) {
    return 'bi-dash-lg'
  }
  if (owner.value?.owner === activity.value.targetAddress) {
    return 'bi-plus-lg'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return 'bi-plus-lg'
  }
  return 'bi-question-circle-fill'
})

</script>
