<template>
  <div class='page-padding full-width text-center home-token-balance'>
    <div>
      {{ tokenBalance.toFixed(4) }} {{ $t('MSG_TEST_LINERA_TOKEN_SYMBOL') }}
    </div>
    <div class='item-currency-sub text-grey-8'>
      $ {{ usdBalance.toFixed(4) }} {{ $t('MSG_USD') }}
    </div>
    <div class='row home-token-action text-center page-y-padding'>
      <q-space />
      <div class='home-token-action-btn cursor-pointer' disabled>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-currency-exchange' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          {{ $t('MSG_EXCHANGE') }}
        </div>
      </div>
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
    <DbOwnerBridge
      v-model:selected-owner='selectedOwner'
      v-model:native-token-balance='tokenBalance'
      v-model:native-usd-balance='usdBalance'
    />
    <DbMicrochainBridge v-model:count='microchainCount' />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { localStore } from 'src/localstores'
import { dbModel } from 'src/model'

import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'

const tokenBalance = ref(0)
const usdBalance = ref(0)
const selectedOwner = ref(undefined as unknown as dbModel.Owner)
const microchainCount = ref(0)

const router = useRouter()

const onTransferClick = () => {
  void router.push({ path: localStore.setting.formalizePath('/transfer') })
}

const onSwapClick = () => {
  window.open('http://api.lineraswap.fun')
}

</script>
