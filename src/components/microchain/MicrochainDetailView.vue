<template>
  <div>
    <div class='row'>
      <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer text-grey-6' @click='onBackClick' />
      <p class='text-center text-grey-6 selector-title page-item-x-margin-left setting-action'>
        {{ microchain.name || 'Microchain information' }}
      </p>
      <q-space />
      <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
    </div>
    <div class='row vertical-sections-margin'>
      <q-space />
      <div class='row bg-red-1 tip cursor-pointer'>
        <div>
          0x{{ shortid.shortId(microchain.microchain, 10) }}
        </div>
        <div class='page-item-x-margin-left'>
          <q-icon name='bi-copy' size='16px' :style='{marginTop: "-3px"}' />
        </div>
      </div>
      <q-space />
    </div>
    <div class='home-token-balance text-center microchain-token-balance'>
      $ {{ (chainUsdBalance + accountUsdBalance).toFixed(4) }}
      <div class='row home-token-action text-center page-y-padding'>
        <q-space />
        <div class='home-token-action-btn cursor-pointer'>
          <q-avatar color='red-2' size='36px'>
            <q-icon name='bi-arrow-up-right' size='24px' />
          </q-avatar>
          <div class='page-item-y-margin-top'>
            Transfer
          </div>
        </div>
        <div class='home-token-action-btn cursor-pointer'>
          <q-avatar color='red-2' size='36px'>
            <q-icon name='bi-arrow-repeat' size='24px' />
          </q-avatar>
          <div class='page-item-y-margin-top'>
            Swap
          </div>
        </div>
        <div class='home-token-action-btn cursor-pointer'>
          <q-avatar color='red-2' size='36px'>
            <q-icon name='bi-arrow-left-right' size='24px' />
          </q-avatar>
          <div class='page-item-y-margin-top'>
            Bridge
          </div>
        </div>
        <div class='home-token-action-btn cursor-pointer'>
          <q-avatar color='red-2' size='36px'>
            <q-icon name='bi-clock' size='24px' />
          </q-avatar>
          <div class='page-item-y-margin-top'>
            Stake
          </div>
        </div>
        <q-space />
      </div>
    </div>
    <div class='vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline'>
      Chain balance
    </div>
    <div class='vertical-items-margin'>
      <MicrochainCardView
        :microchain='microchain' :show-account-balance='false' :integrated-mode='false' :clickable='false'
        :show-indicator='false'
      />
    </div>
    <div class='vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline'>
      Account balance
    </div>
    <div class='vertical-items-margin'>
      <MicrochainCardView
        :microchain='microchain' :show-account-balance='true' :integrated-mode='false' :clickable='false'
        :show-indicator='false'
      />
    </div>
    <div class='vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline'>
      Chain details
    </div>
    <div class='row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        Microchain ID
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center'>
        <div class='microchain-detail-value-text text-right'>
          {{ microchain.microchain }}
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' />
      </div>
    </div>
    <div class='row decorate-underline-dashed vertical-items-margin cursor-pointer microchain-detail-line'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        Creation message ID
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center'>
        <div class='microchain-detail-value-text  text-right'>
          {{ microchain.messageId }}
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' />
      </div>
    </div>
    <div class='row decorate-underline-dashed vertical-items-margin cursor-pointer microchain-detail-line'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        Creation certificate hash
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center'>
        <div class='microchain-detail-value-text text-right'>
          {{ microchain.certificateHash }}
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' />
      </div>
    </div>
    <div class='row decorate-underline-dashed vertical-items-margin cursor-pointer microchain-detail-line'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        Default chain
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value'>
        <div class='full-width text-right'>
          {{ microchain.default ? 'YES' : 'NO' }}
        </div>
      </div>
    </div>
    <div class='vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline'>
      Chain activity
    </div>
    <div class='vertical-menus-margin extra-large-bottom-margin'>
      <div v-if='activities.length > 0'>
        <div v-for='activity in activities' :key='activity.id'>
          {{ activity }}
        </div>
      </div>
      <div v-else>
        <p class='text-grey-6 text-center'>
          This microchain doesn't have any transaction.
        </p>
      </div>
    </div>
  </div>
  <MicrochainBalanceBridge :token-id='nativeTokenId' v-model:token-balance='chainTokenBalance' v-model:usd-balance='chainUsdBalance' />
  <MicrochainOwnerBalanceBridge
    :token-id='nativeTokenId' v-model:token-balance='accountTokenBalance' v-model:usd-balance='accountUsdBalance' :owner='selectedOwner?.owner'
    :microchain-id='microchain.microchain'
  />
  <TokenBridge ref='dbTokenBridge' />
  <OwnerBridge v-model:selected-owner='selectedOwner' />
  <ActivityBridge v-model:activities='activities' :microchain='microchain.microchain' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { shortid } from 'src/utils'

import MicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import MicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import TokenBridge from '../bridge/db/TokenBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainCardView from './MicrochainCardView.vue'
import ActivityBridge from '../bridge/db/ActivityBridge.vue'

interface Props {
  microchain: db.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

const chainTokenBalance = ref(0)
const chainUsdBalance = ref(0)
const accountTokenBalance = ref(0)
const accountUsdBalance = ref(0)
const activities = ref([] as db.Activity[])

const selectedOwner = ref(undefined as unknown as db.Owner)

const dbTokenBridge = ref<InstanceType<typeof TokenBridge>>()

const emit = defineEmits<{(ev: 'back'): void,
  (ev: 'close'): void
}>()

const onBackClick = () => {
  emit('back')
}

const onCloseClick = () => {
  emit('close')
}

const nativeTokenId = ref(undefined as unknown as number)

onMounted(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  nativeTokenId.value = (await dbTokenBridge.value?.nativeToken())?.id as number
})

</script>
