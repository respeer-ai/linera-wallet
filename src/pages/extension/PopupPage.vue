<template>
  <div class='bg-grey-2' :style='{height: "100%"}'>
    <div class='bg-white' :style='{width: "calc(100% + 48px)", height: "84px", margin: "-12px -24px 0 -24px"}'>
      <PopupHeader />
    </div>
    <div
      v-if='popupType === middlewaretypes.PopupRequestType.CONFIRMATION && popupRequest === middlewaretypes.RpcMethod.ETH_REQUEST_ACCOUNTS'
      :style='{height: "calc(100% - 84px - 12px)", width: "100%"}'
    >
      <EthRequestAccountsConfirmation />
    </div>
    <div
      v-if='popupType === middlewaretypes.PopupRequestType.CONFIRMATION && popupRequest === middlewaretypes.RpcMethod.LINERA_GRAPHQL_MUTATION'
      :style='{height: "calc(100% - 84px - 12px)", width: "100%"}'
    >
      <LineraGraphqlMutationConfirmation />
    </div>
  </div>
</template>
<script setup lang='ts'>
import { useQuasar } from 'quasar'
import { computed, onMounted, onUnmounted, watch } from 'vue'
import { BexPayload } from '@quasar/app-vite'
import { popup, wallet } from 'src/localstores'
import * as middlewaretypes from '../../../src-bex/middleware/types'
import { commontypes } from 'src/types'

import PopupHeader from 'src/components/extension/PopupHeader.vue'
import EthRequestAccountsConfirmation from 'src/components/extension/popup/EthRequestAccountsConfirmation.vue'
import LineraGraphqlMutationConfirmation from 'src/components/extension/popup/LineraGraphqlMutationConfirmation.vue'

const quasar = useQuasar()
const _popup = popup.usePopupStore()
const popupCount = computed(() => _popup.popups.size)
const popupType = computed(() => _popup._popupType)
const popupRequest = computed(() => _popup._popupRequest)
const _wallet = wallet.useWalletStore()

const handleNewRequest = (payload: BexPayload<commontypes.PopupRequest, unknown>) => {
  switch (payload.data.type) {
    case middlewaretypes.PopupRequestType.CONFIRMATION:
      if (payload.data.type === middlewaretypes.PopupRequestType.CONFIRMATION) {
        _popup.addConnection({
          origin: payload.data.request.origin,
          favicon: payload.data.request.favicon,
          name: payload.data.request.name
        })
      }
      return _popup.insertRequest(payload)
    default:
      return void payload.respond({})
  }
}

onMounted(() => {
  _popup.$reset()
  _wallet.loadWithoutDecrypt()
  quasar.bex.on('popup.new', handleNewRequest)
})

onUnmounted(() => {
  quasar.bex.off('popup.new', handleNewRequest)
})

watch(popupCount, () => {
  console.log(popupCount.value, 2222)
  if (popupCount.value > 0) {
    return
  }
  window.close()
})

</script>
