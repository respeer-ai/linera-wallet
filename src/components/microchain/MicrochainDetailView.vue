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
      <div class='row bg-red-1 tip cursor-pointer label-radius'>
        <div>
          0x{{ shortid.shortId(microchain.microchain, 10) }}
        </div>
        <div class='page-item-x-margin-left'>
          <q-icon name='bi-copy' size='16px' :style='{marginTop: "-3px"}' @click.stop='(evt) => _copyToClipboard(microchain.microchain, evt)' />
        </div>
      </div>
      <q-space />
    </div>
    <div class='home-token-balance text-center microchain-token-balance'>
      $ {{ (chainUsdBalance + accountUsdBalance).toFixed(4) }}
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
        <div class='home-token-action-btn cursor-pointer' @click='onSwapClick'>
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
        <q-space />
      </div>
    </div>
    <MicrochainDetailInnerView :microchain='microchain' />
  </div>
  <MicrochainBalanceBridge :token-id='nativeTokenId' v-model:token-balance='chainTokenBalance' v-model:usd-balance='chainUsdBalance' />
  <MicrochainOwnerBalanceBridge
    :token-id='nativeTokenId' v-model:token-balance='accountTokenBalance' v-model:usd-balance='accountUsdBalance' :owner='selectedOwner?.owner'
    :microchain-id='microchain.microchain'
  />
  <OwnerBridge v-model:selected-owner='selectedOwner' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { shortid } from 'src/utils'
import { useRouter } from 'vue-router'
import { localStore } from 'src/localstores'
import { _copyToClipboard } from 'src/utils/copycontent'

import MicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import MicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainDetailInnerView from './MicrochainDetailInnerView.vue'
import { dbBridge } from 'src/bridge'

interface Props {
  microchain: db.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

const chainTokenBalance = ref(0)
const chainUsdBalance = ref(0)
const accountTokenBalance = ref(0)
const accountUsdBalance = ref(0)

const selectedOwner = ref(undefined as unknown as db.Owner)

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
  nativeTokenId.value = (await dbBridge.Token.native())?.id as number
})

const router = useRouter()

const onTransferClick = () => {
  void router.push({
    path: localStore.setting.formalizePath('/transfer'),
    query: {
      fromMicrochainId: microchain.value.microchain
    }
  })
}

const onSwapClick = () => {
  window.open('https://testnet-archimedes.lineraswap.fun')
}

</script>
