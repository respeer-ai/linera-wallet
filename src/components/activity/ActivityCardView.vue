<template>
  <q-item class='row full-width tab-panel-item' clickable :style='{ paddingLeft: xPadding, paddingRight: xPadding }'>
    <q-avatar size='32px'>
      <q-icon :name='icon' size='24px' />
      <q-badge color='transparent' rounded transparent floating>
        <q-img :src='lineraLogo' width='14px' height='14px' />
      </q-badge>
    </q-avatar>
    <div class='selector-margin-x-left row' :style='{width: "calc(100% - 32px - " + xPadding + " - " + xPadding + ")"}'>
      <div>
        <div class='text-bold text-left'>
          {{ action }}
        </div>
        <div class='text-grey-9 row flex items-center justify-center'>
          <div>
            0x{{ shortid.shortId(address, 8) }}
          </div>
          <div class='page-item-x-margin-left cursor-pointer'>
            <q-icon name='bi-copy' size='12px' :style='{marginBottom: "3px"}' />
          </div>
        </div>
        <div class='text-left label-text-small text-grey-6'>
          {{ date.formatDate(activity.timestamp / 1000, 'YYYY/MM/DD HH:mm:ss') }}
        </div>
      </div>
      <q-space />
      <div class='row text-bold'>
        <q-icon :name='direction' color='black' size='12px' :style='{marginTop: "5px"}' />
        <div class='page-item-x-margin-left'>
          {{ Number(activity.amount).toFixed(4) }} {{ token?.ticker }}
        </div>
      </div>
    </div>
  </q-item>
  <OwnerBridge v-model:selected-owner='owner' />
  <MicrochainOwnerBridge :owner='owner?.owner' v-model:microchain-owners='microchainOwners' />
  <TokenBridge ref='dbTokenBridge' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { shortid } from 'src/utils'
import { computed, onMounted, ref, toRef } from 'vue'
import { date } from 'quasar'

import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import TokenBridge from '../bridge/db/TokenBridge.vue'

import { lineraLogo } from 'src/assets'

interface Props {
  activity: db.Activity
  xPadding?: string
}
const props = defineProps<Props>()
const activity = toRef(props, 'activity')
const xPadding = toRef(props, 'xPadding')

const owner = ref(undefined as unknown as db.Owner)
const microchainOwners = ref([] as db.MicrochainOwner[])
const token = ref(undefined as unknown as db.Token)

const dbTokenBridge = ref<InstanceType<typeof TokenBridge>>()

const action = computed(() => {
  console.log(activity.value, owner.value)
  if (activity.value.sourceAddress === activity.value.targetAddress) {
    return 'Move'
  }
  if (activity.value.microchain === activity.value.sourceChain) {
    return 'Send'
  }
  if (activity.value.microchain === activity.value.targetChain) {
    return 'Receive'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0 &&
      microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return 'Move'
  }
  if (owner.value?.owner === activity.value.sourceAddress) {
    return 'Send'
  }
  if (owner.value?.owner === activity.value.targetAddress) {
    return 'Receive'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0) {
    return 'Send'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return 'Receive'
  }
  return 'Unknown'
})

const address = computed(() => {
  if (activity.value.sourceAddress === activity.value.targetAddress && activity.value.targetAddress?.length) {
    return activity.value.sourceChain
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0 &&
      microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return activity.value.sourceAddress || activity.value.sourceChain
  }
  if (owner.value?.owner === activity.value.sourceAddress) {
    return activity.value.targetAddress || activity.value.targetChain
  }
  if (owner.value?.owner === activity.value.targetAddress) {
    return activity.value.sourceAddress || activity.value.sourceChain
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0) {
    return activity.value.targetAddress || activity.value.targetChain
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return activity.value.sourceAddress || activity.value.sourceChain
  }
  return 'Unknown'
})

const direction = computed(() => {
  if (activity.value.sourceAddress === activity.value.targetAddress && activity.value.targetAddress?.length) {
    return 'bi-arrows'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0 &&
      microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return 'bi-arrows'
  }
  if (owner.value?.owner === activity.value.sourceAddress) {
    return 'bi-dash-lg'
  }
  if (owner.value?.owner === activity.value.targetAddress) {
    return 'bi-plus-lg'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0) {
    return 'bi-dash-lg'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return 'bi-plus-lg'
  }
  return 'bi-question-circle-fill'
})

const icon = computed(() => {
  if (activity.value.sourceAddress === activity.value.targetAddress && activity.value.targetAddress?.length) {
    return 'bi-arrow-right-square'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0 &&
      microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return 'bi-arrow-right-square'
  }
  if (activity.value.sourceAddress === owner.value?.address) {
    return 'bi-box-arrow-right'
  }
  if (activity.value.targetAddress === owner.value?.address) {
    return 'bi-box-arrow-in-right'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0) {
    return 'bi-box-arrow-right'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return 'bi-box-arrow-in-right'
  }
  return 'bi-question-circle-fill'
})

onMounted(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  token.value = await dbTokenBridge.value?.tokenWithId(activity.value.tokenId) as db.Token
})

</script>

<style scope lang='sass'>
.q-badge
  padding: 2px 0
</style>
