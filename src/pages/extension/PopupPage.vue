<template>
  <div class='bg-grey-2 full-height'>
    <div class='bg-white full-width page-x-padding popup-header'>
      <PopupHeader />
    </div>
    <div class='text-bold label-text-large popup-title text-center'>
      {{ title }}
    </div>
    <div
      v-if='popupType === middlewaretypes.PopupRequestType.CONFIRMATION && popupRequest === middlewaretypes.RpcMethod.ETH_REQUEST_ACCOUNTS'
      class='popup-body full-width'
    >
      <EthRequestAccountsConfirmation v-model:title='title' />
    </div>
    <div
      v-if='popupType === middlewaretypes.PopupRequestType.CONFIRMATION && popupRequest === middlewaretypes.RpcMethod.LINERA_GRAPHQL_MUTATION'
      class='popup-body full-width'
    >
      <LineraGraphqlMutationConfirmation v-model:title='title' />
    </div>
    <div
      v-if='popupType === middlewaretypes.PopupRequestType.CONFIRMATION && popupRequest === middlewaretypes.RpcMethod.ETH_SIGN'
      class='popup-body full-width'
    >
      <EthSignConfirmation v-model:title='title' />
    </div>
    <div class='label-text-small text-center like-link bg-white popup-tip'>
      Only approve trusted application
    </div>
  </div>
</template>
<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { localStore } from 'src/localstores'
import * as middlewaretypes from '../../../src-bex/middleware/types'

import PopupHeader from 'src/components/extension/PopupHeader.vue'
import EthRequestAccountsConfirmation from 'src/components/extension/popup/EthRequestAccountsConfirmation.vue'
import LineraGraphqlMutationConfirmation from 'src/components/extension/popup/LineraGraphqlMutationConfirmation.vue'
import EthSignConfirmation from 'src/components/extension/popup/EthSignConfirmation.vue'

const title = ref('')
const popupCount = computed(() => localStore.popup.popups.size)
const popupType = computed(() => localStore.popup._popupType)
const popupRequest = computed(() => localStore.popup._popupRequest)
const closeTimeout = ref(-1)

watch(popupCount, () => {
  if (popupCount.value > 0) {
    if (closeTimeout.value >= 0) {
      window.clearTimeout(closeTimeout.value)
    }
    return
  }
  closeTimeout.value = window.setTimeout(() => {
    window.close()
  }, 100)
})

</script>
