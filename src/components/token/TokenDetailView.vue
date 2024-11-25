<template>
  <div>
    <div class='row'>
      <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer text-grey-6' @click='onBackClick' />
      <p class='text-center text-grey-6 selector-title page-item-x-margin-left setting-action'>
        {{ token.name || 'Token information' }}
      </p>
      <q-space />
      <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
    </div>
    <div v-if='!token.native' class='row vertical-sections-margin'>
      <q-space />
      <div class='row bg-red-1 tip cursor-pointer label-radius'>
        <div>
          0x{{ shortid.shortId(token?.applicationId as string, 16) }}
        </div>
        <div class='page-item-x-margin-left'>
          <q-icon name='bi-copy' size='16px' :style='{marginTop: "-3px"}' />
        </div>
      </div>
      <q-space />
    </div>
    <div class='home-token-balance text-center microchain-token-balance'>
      {{ accountTokenBalance.toFixed(4) }} {{ token.ticker }}
      <div class='row home-token-action text-center page-y-padding'>
        <q-space />
        <div class='home-token-action-btn cursor-pointer' @click='onTransferClick'>
          <q-avatar color='red-2' size='36px'>
            <q-icon name='bi-arrow-up-right' size='24px' />
          </q-avatar>
          <div class='page-item-y-margin-top'>
            {{ $t('MSG_TRANSFER') }}
          </div>
        </div>
        <div class='home-token-action-btn cursor-pointer' disabled>
          <q-avatar color='red-2' size='36px'>
            <q-icon name='bi-arrow-repeat' size='24px' />
          </q-avatar>
          <div class='page-item-y-margin-top'>
            {{ $t('MSG_SWAP') }}
          </div>
        </div>
        <div class='home-token-action-btn cursor-pointer' disabled>
          <q-avatar color='red-2' size='36px'>
            <q-icon name='bi-arrow-left-right' size='24px' />
          </q-avatar>
          <div class='page-item-y-margin-top'>
            {{ $t('MSG_BRIDGE') }}
          </div>
        </div>
        <div class='home-token-action-btn cursor-pointer' disabled>
          <q-avatar color='red-2' size='36px'>
            <q-icon name='bi-clock' size='24px' />
          </q-avatar>
          <div class='page-item-y-margin-top'>
            {{ $t('MSG_STAKE') }}
          </div>
        </div>
        <div v-if='!token.native && token.mintable' class='home-token-action-btn cursor-pointer' @click='onMintClick'>
          <q-avatar color='red-2' size='36px'>
            <q-icon name='bi-plus-circle' size='24px' />
          </q-avatar>
          <div class='page-item-y-margin-top'>
            {{ $t('MSG_MINT') }}
          </div>
        </div>
        <q-space />
      </div>
    </div>
    <div class='extra-margin-bottom'>
      <TokenDetailInnerView :token='token' />
    </div>
  </div>
  <OwnerBalanceBridge :token-id='token?.id' v-model:token-balance='accountTokenBalance' v-model:usd-balance='accountUsdBalance' />
  <TokenBridge ref='dbTokenBridge' />
  <OwnerBridge v-model:selected-owner='selectedOwner' />
  <q-dialog v-model='minting'>
    <q-card class='dialog transfer-card page-x-padding'>
      <h5 class='onboarding-page-title text-center page-title'>
        {{ $t('MSG_MINT') }} {{ token.ticker }}
      </h5>
      <MintTokenView @minted='onTokenMinted' :token='token' />
    </q-card>
  </q-dialog>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { shortid } from 'src/utils'
import { useRouter } from 'vue-router'
import { localStore } from 'src/localstores'

import TokenBridge from '../bridge/db/TokenBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import TokenDetailInnerView from './TokenDetailInnerView.vue'
import OwnerBalanceBridge from '../bridge/db/OwnerBalanceBridge.vue'
import MintTokenView from './MintTokenView.vue'

interface Props {
  token: db.Token
}
const props = defineProps<Props>()
const token = toRef(props, 'token')

const accountTokenBalance = ref(0)
const accountUsdBalance = ref(0)
const minting = ref(false)

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

const router = useRouter()

const onTransferClick = () => {
  void router.push({
    path: localStore.setting.formalizePath('/transfer'),
    query: {
      applicationId: token.value.applicationId
    }
  })
}

const onMintClick = () => {
  minting.value = true
}

const onTokenMinted = () => {
  minting.value = false
}

</script>
