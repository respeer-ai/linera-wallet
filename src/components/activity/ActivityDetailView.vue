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
    <div class='row items-x-margin'>
      <div class='text-grey-9'>
        <strong>{{ $t('MSG_STATUS') }}</strong>
      </div>
      <q-space />
      <div class='text-green-8'>
        <strong>{{ $t('MSG_CONFIRMED') }}</strong>
      </div>
    </div>
    <div class='row vertical-items-margin items-x-margin'>
      <div class='text-grey-9'>
        <strong>{{ $t('MSG_TRANSACTION_ID') }}</strong>
      </div>
      <q-space />
      <div class='text-grey-6'>
        {{ shortid.shortId(activity.certificateHash, 8) }}
      </div>
      <div class='page-item-x-margin-left'>
        <q-icon name='bi-copy' size='16px' :style='{marginTop: "-3px"}' @click.stop='(evt) => _copyToClipboard(activity.certificateHash, evt)' />
      </div>
    </div>
    <q-separator class='vertical-menus-margin' />
    <div class='vertical-menus-margin decorate-underline text-bold items-x-margin'>
      {{ $t('MSG_FROM') }}
    </div>
    <div class='vertical-menus-margin transfer-tip items-x-margin cursor-pointer'>
      <div class='setting-item word-break-all'>
        {{ activity.sourceChain }}
      </div>
      <div class='row vertical-items-margin' :style='{marginTop: "-24px"}'>
        <q-space />
        <q-img :src='microchainLogo' width='16px' height='16px' />
        <q-avatar size='16px' class='page-item-x-margin-left'>
          <q-img v-if='sourceMicrochain' :src='db.microchainAvatar(sourceMicrochain)' width='16px' height='16px' />
        </q-avatar>
      </div>
    </div>
    <div v-if='activity.sourceAddress?.length' class='vertical-menus-margin transfer-tip items-x-margin cursor-pointer'>
      <div class='setting-item word-break-all'>
        {{ activity.sourceAddress }}
      </div>
      <div class='row vertical-items-margin' :style='{marginTop: "-24px"}'>
        <q-space />
        <q-avatar size='16px'>
          <q-img v-if='sourceOwner' :src='db.ownerAvatar(sourceOwner)' width='16px' height='16px' />
        </q-avatar>
      </div>
    </div>
    <div class='vertical-menus-margin decorate-underline text-bold items-x-margin'>
      {{ $t('MSG_TO') }}
    </div>
    <div class='vertical-menus-margin transfer-tip items-x-margin cursor-pointer'>
      <div class='setting-item word-break-all'>
        {{ activity.targetChain }}
      </div>
      <div class='row vertical-items-margin' :style='{marginTop: "-24px"}'>
        <q-space />
        <q-img :src='microchainLogo' width='16px' height='16px' />
        <q-avatar size='16px' class='page-item-x-margin-left'>
          <q-img v-if='targetMicrochain' :src='db.microchainAvatar(targetMicrochain)' width='16px' height='16px' />
        </q-avatar>
      </div>
    </div>
    <div v-if='activity.targetAddress?.length' class='vertical-items-margin transfer-tip items-x-margin cursor-pointer'>
      <div class='setting-item word-break-all'>
        {{ activity.targetAddress }}
      </div>
      <div class='row vertical-items-margin' :style='{marginTop: "-24px"}'>
        <q-space />
        <q-avatar size='16px'>
          <q-img v-if='targetOwner' :src='db.ownerAvatar(targetOwner)' width='16px' height='16px' />
        </q-avatar>
      </div>
    </div>
    <div class='vertical-menus-margin decorate-underline text-bold items-x-margin'>
      {{ $t('MSG_TRANSACTION') }}
    </div>
    <div class='row vertical-menus-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_ACTION') }}</div>
      <q-space />
      <div>{{ action }}</div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_AMOUNT') }}</div>
      <q-space />
      <div><strong>{{ activity.amount }} {{ token?.ticker }}</strong></div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_BLOCK_HEIGHT') }}</div>
      <q-space />
      <div>{{ activity.blockHeight }}</div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_GRANT') }}</div>
      <q-space />
      <div>{{ activity.grant }} {{ token?.ticker }}</div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed word-break-all items-x-margin'>
      <div :style='{width: "128px"}'>
        {{ $t('MSG_CERTIFICATE_HASH') }}
      </div>
      <div class='text-right' :style='{width: "calc(100% - 148px)"}'>
        {{ activity.certificateHash }}
      </div>
    </div>
    <div class='row extra-margin-bottom vertical-items-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_DATE') }}</div>
      <q-space />
      <div>{{ date.formatDate(activity.timestamp / 1000, 'YYYY/MM/DD HH:mm:ss') }}</div>
    </div>
  </div>
  <OwnerBridge ref='dbOwnerBridge' v-model:selected-owner='selectedOwner' />
  <MicrochainOwnerBridge v-if='selectedOwner' :owner='selectedOwner?.owner' v-model:microchain-owners='microchainOwners' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, onMounted, ref, toRef } from 'vue'
import { shortid } from 'src/utils'
import { date } from 'quasar'
import { _copyToClipboard } from 'src/utils/copycontent'

import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'

import { microchainLogo } from 'src/assets'
import { dbBridge } from 'src/bridge'

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
    const address = activity.value.sourceAddress.includes(':') ? activity.value.sourceAddress.split(':')[1] : activity.value.sourceAddress
    sourceOwner.value = await dbBridge.Owner.owner(address) as db.Owner
  }
  sourceMicrochain.value = await dbBridge.Microchain.microchain(activity.value.sourceChain) as db.Microchain
  if (activity.value.targetAddress?.length) {
    const address = activity.value.targetAddress.includes(':') ? activity.value.targetAddress.split(':')[1] : activity.value.targetAddress
    targetOwner.value = await dbBridge.Owner.owner(address) as db.Owner
  }
  targetMicrochain.value = await dbBridge.Microchain.microchain(activity.value.targetChain) as db.Microchain
  token.value = await dbBridge.Token.tokenWithId(activity.value.tokenId || 1) as db.Token
})

</script>
