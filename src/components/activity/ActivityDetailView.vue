<template>
  <div>
    <div class='row'>
      <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer text-grey-6' @click='onBackClick' />
      <p class='text-center text-grey-6 selector-title page-item-x-margin-left setting-action'>
        {{ action }}
      </p>
      <q-space />
      <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
    </div>
    <div class='row'>
      <div class='text-grey-9'>
        <strong>{{ $t('MSG_STATUS') }}</strong>
      </div>
      <q-space />
      <div class='text-green-8'>
        <strong>{{ $t('MSG_CONFIRMED') }}</strong>
      </div>
    </div>
    <div class='row vertical-items-margin'>
      <div class='text-grey-9'>
        <strong>{{ $t('MSG_TRANSACTION_ID') }}</strong>
      </div>
      <q-space />
      <div class='text-grey-6'>
        {{ shortid.shortId(activity.certificateHash, 8) }}
      </div>
      <div class='page-item-x-margin-left'>
        <q-icon name='bi-copy' size='16px' :style='{marginTop: "-3px"}' />
      </div>
    </div>
    <q-separator class='vertical-menus-margin' />
    <div class='vertical-menus-margin decorate-underline text-bold'>
      {{ $t('MSG_FROM') }}
    </div>
    <div class='row vertical-menus-margin transfer-tip'>
      <div>
        <q-img :src='microchainLogo' width='28px' height='28px' />
      </div>
      <q-avatar size='28px' class='page-item-x-margin-left'>
        <q-img v-if='sourceMicrochain' :src='db.microchainAvatar(sourceMicrochain)' width='28px' height='28px' />
      </q-avatar>
      <div class='selector-margin-x-left setting-item'>
        {{ activity.sourceChain }}
      </div>
    </div>
    <div v-if='activity.sourceAddress?.length' class='row vertical-menus-margin transfer-tip'>
      <q-avatar size='28px'>
        <q-img v-if='sourceOwner' :src='db.ownerAvatar(sourceOwner)' width='28px' height='28px' />
      </q-avatar>
      <div class='setting-icon page-item-x-margin-left' />
      <div class='selector-margin-x-left setting-item'>
        {{ activity.sourceAddress }}
      </div>
    </div>
    <div class='vertical-menus-margin decorate-underline text-bold'>
      {{ $t('MSG_TO') }}
    </div>
    <div class='row vertical-menus-margin transfer-tip'>
      <div>
        <q-img :src='microchainLogo' width='28px' height='28px' />
      </div>
      <q-avatar size='28px' class='page-item-x-margin-left'>
        <q-img v-if='targetMicrochain' :src='db.microchainAvatar(targetMicrochain)' width='28px' height='28px' />
      </q-avatar>
      <div class='selector-margin-x-left setting-item'>
        {{ activity.targetChain }}
      </div>
    </div>
    <div v-if='activity.targetAddress?.length' class='row vertical-items-margin transfer-tip'>
      <q-avatar size='28px'>
        <q-img v-if='targetOwner' :src='db.ownerAvatar(targetOwner)' width='28px' height='28px' />
      </q-avatar>
      <div class='setting-icon page-item-x-margin-left' />
      <div class='selector-margin-x-left setting-item'>
        {{ activity.targetAddress }}
      </div>
    </div>
    <div class='vertical-menus-margin decorate-underline text-bold'>
      {{ $t('MSG_TRANSACTION') }}
    </div>
    <div class='row vertical-menus-margin decorate-underline-dashed'>
      <div>{{ $t('MSG_ACTION') }}</div>
      <q-space />
      <div>{{ action }}</div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed'>
      <div>{{ $t('MSG_AMOUNT') }}</div>
      <q-space />
      <div><strong>{{ activity.amount }} {{ token?.ticker }}</strong></div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed'>
      <div>{{ $t('MSG_BLOCK_HEIGHT') }}</div>
      <q-space />
      <div>{{ activity.blockHeight }}</div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed'>
      <div>{{ $t('MSG_GRANT') }}</div>
      <q-space />
      <div>{{ activity.grant }} {{ token?.ticker }}</div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed'>
      <div>{{ $t('MSG_CERTIFICATE_HASH') }}</div>
      <q-space />
      <div>{{ activity.certificateHash }}</div>
    </div>
    <div class='row extra-margin-bottom vertical-items-margin decorate-underline-dashed'>
      <div>{{ $t('MSG_DATE') }}</div>
      <q-space />
      <div>{{ date.formatDate(activity.timestamp / 1000, 'YYYY/MM/DD HH:mm:ss') }}</div>
    </div>
  </div>
  <TokenBridge ref='dbTokenBridge' />
  <OwnerBridge ref='dbOwnerBridge' v-model:selected-owner='selectedOwner' />
  <MicrochainOwnerBridge v-if='selectedOwner' :owner='selectedOwner?.owner' v-model:microchain-owners='microchainOwners' />
  <DbMicrochainBridge ref='dbMicrochainBridge' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, onMounted, ref, toRef } from 'vue'
import { shortid } from 'src/utils'
import { date } from 'quasar'

import TokenBridge from '../bridge/db/TokenBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'

import { microchainLogo } from 'src/assets'

interface Props {
  activity: db.Activity
}
const props = defineProps<Props>()
const activity = toRef(props, 'activity')

const selectedOwner = ref(undefined as unknown as db.Owner)
const microchainOwners = ref([] as db.MicrochainOwner[])
const sourceOwner = ref(undefined as unknown as db.Owner)
const sourceMicrochain = ref(undefined as unknown as db.Microchain)
const targetOwner = ref(undefined as unknown as db.Owner)
const targetMicrochain = ref(undefined as unknown as db.Microchain)
const token = ref(undefined as unknown as db.Token)

const action = computed(() => {
  if (activity.value.sourceAddress === activity.value.targetAddress) {
    return 'Move'
  }
  if (microchainOwners.value.findIndex((el) => el.microchain === activity.value.sourceChain) >= 0 &&
      microchainOwners.value.findIndex((el) => el.microchain === activity.value.targetChain) >= 0) {
    return 'Move'
  }
  if (selectedOwner.value?.owner === activity.value.sourceAddress) {
    return 'Send'
  }
  if (selectedOwner.value?.owner === activity.value.targetAddress) {
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

const dbTokenBridge = ref<InstanceType<typeof TokenBridge>>()
const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()
const dbOwnerBridge = ref<InstanceType<typeof OwnerBridge>>()

const emit = defineEmits<{(ev: 'back'): void,
  (ev: 'close'): void
}>()

const onBackClick = () => {
  emit('back')
}

const onCloseClick = () => {
  emit('close')
}

onMounted(async () => {
  if (activity.value.sourceAddress?.length) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    sourceOwner.value = await dbOwnerBridge.value?.getOwner(activity.value.sourceAddress) as db.Owner
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  sourceMicrochain.value = await dbMicrochainBridge.value?.getMicrochain(activity.value.sourceChain) as db.Microchain
  if (activity.value.targetAddress?.length) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    targetOwner.value = await dbOwnerBridge.value?.getOwner(activity.value.targetAddress) as db.Owner
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  targetMicrochain.value = await dbMicrochainBridge.value?.getMicrochain(activity.value.targetChain) as db.Microchain
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  token.value = await dbTokenBridge.value?.tokenWithId(activity.value.tokenId || 1) as db.Token
})

</script>
