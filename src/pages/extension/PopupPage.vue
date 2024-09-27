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
import { useQuasar } from 'quasar'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { BexPayload } from '@quasar/app-vite'
import { localStore } from 'src/localstores'
import * as middlewaretypes from '../../../src-bex/middleware/types'
import { commontypes } from 'src/types'

import PopupHeader from 'src/components/extension/PopupHeader.vue'
import EthRequestAccountsConfirmation from 'src/components/extension/popup/EthRequestAccountsConfirmation.vue'
import LineraGraphqlMutationConfirmation from 'src/components/extension/popup/LineraGraphqlMutationConfirmation.vue'
import EthSignConfirmation from 'src/components/extension/popup/EthSignConfirmation.vue'

const quasar = useQuasar()

const title = ref('')
const popupCount = computed(() => localStore.popup.popups.size)
const popupType = computed(() => localStore.popup._popupType)
const popupRequest = computed(() => localStore.popup._popupRequest)
const closeTimeout = ref(-1)

const handleNewRequest = (payload: BexPayload<commontypes.PopupRequest, unknown>) => {
  if (closeTimeout.value >= 0) {
    window.clearTimeout(closeTimeout.value)
  }
  switch (payload.data.type) {
    case middlewaretypes.PopupRequestType.CONFIRMATION:
      localStore.popup.addConnection({
        origin: payload.data.request.origin,
        favicon: payload.data.request.favicon,
        name: payload.data.request.name
      })
      return localStore.popup.insertRequest(payload)
    default:
      return void payload.respond({})
  }
}

onMounted(() => {
  localStore.popup.$reset()
  quasar.bex?.on('popup.new', handleNewRequest)
})

onUnmounted(() => {
  quasar.bex?.off('popup.new', handleNewRequest)
})

watch(popupCount, () => {
  if (popupCount.value > 0) {
    return
  }
  closeTimeout.value = window.setTimeout(() => {
    window.close()
  }, 100)
})

</script>
