<template>
  <div class='popup-shell full-height'>
    <div class='full-width popup-header'>
      <PopupHeader />
    </div>
    <div class='popup-title-wrap'>
      <div v-if='popupCount > 1' class='popup-queue text-caption text-weight-medium'>
        {{ popupCount }} requests pending
      </div>
      <div class='text-bold label-text-large popup-title text-center'>
        {{ title }}
      </div>
    </div>
    <div
      v-if='popupType === middlewaretypes.PopupRequestType.CONFIRMATION && popupRequest === middlewaretypes.RpcMethod.ETH_REQUEST_ACCOUNTS'
      class='popup-body full-width'
    >
      <EthRequestAccountsConfirmation :key='popupRequestId' v-model:title='title' />
    </div>
    <div
      v-if='popupType === middlewaretypes.PopupRequestType.CONFIRMATION && (popupRequest === middlewaretypes.RpcMethod.LINERA_GRAPHQL_MUTATION)'
      class='popup-body full-width'
    >
      <LineraGraphqlMutationConfirmation :key='popupRequestId' v-model:title='title' />
    </div>
    <div
      v-if='popupType === middlewaretypes.PopupRequestType.CONFIRMATION && popupRequest === middlewaretypes.RpcMethod.ETH_SIGN'
      class='popup-body full-width'
    >
      <EthSignConfirmation :key='popupRequestId' v-model:title='title' />
    </div>
    <div class='label-text-small text-center popup-tip'>
      {{ $t('MSG_ONLY_APPROVE_TRUSTED_APPLICATIONS') }}
    </div>
  </div>
</template>
<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { localStore } from 'src/localstores'
import * as middlewaretypes from '../../../src-bex/middleware/types'
import { useQuasar } from 'quasar'
import { BexPayload } from '@quasar/app-vite'
import { commontypes } from 'src/types'

import PopupHeader from 'src/components/extension/PopupHeader.vue'
import EthRequestAccountsConfirmation from 'src/components/extension/popup/EthRequestAccountsConfirmation.vue'
import LineraGraphqlMutationConfirmation from 'src/components/extension/popup/LineraGraphqlMutationConfirmation.vue'
import EthSignConfirmation from 'src/components/extension/popup/EthSignConfirmation.vue'

const title = ref('')
const popupCount = computed(() => localStore.popup.popups.size)
const popupType = computed(() => localStore.popup._popupType)
const popupRequest = computed(() => localStore.popup._popupRequest)
const popupRequestId = computed(() => localStore.popup.popupRequestId)
const closeTimeout = ref(-1)

const quasar = useQuasar()

const handleBeforeUnload = () => {
  void localStore.popup.rejectAllRequests('Popup closed by user')
}

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

const handleUpdateRequest = (payload: BexPayload<commontypes.PopupRequest, unknown>) => {
  try {
    switch (payload.data.type) {
      case middlewaretypes.PopupRequestType.EXECUTION:
        // It can only update a confirmed popup
        if (!localStore.popup.updateRequest(payload)) {
          return void payload.respond({
            code: -1,
            message: 'Invalid request'
          })
        }
        break
      default:
        return void payload.respond({
          code: -1,
          message: 'Invalid request'
        })
    }
  } catch {
    return void payload.respond({
      code: -1,
      message: 'Popup update handling failed'
    })
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  quasar.bex?.on('popup.update', handleUpdateRequest)
})

onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  quasar.bex?.off('popup.update', handleUpdateRequest)
})

</script>

<style scoped lang='sass'>
.popup-shell
  display: flex
  flex-direction: column
  min-height: 100%
  background: #ffffff

.popup-header
  padding: 14px 16px 12px
  background: #ffffff
  border-bottom: 1px solid rgba(214, 217, 220, 0.9)

.popup-title-wrap
  padding: 14px 16px 10px

.popup-queue
  width: fit-content
  margin: 0 auto 10px
  padding: 4px 10px
  color: #0376c9
  background: rgba(3, 118, 201, 0.08)
  border: 1px solid rgba(3, 118, 201, 0.16)
  border-radius: 999px
  letter-spacing: 0.02em

.popup-title
  color: #1f2937
  line-height: 1.25
  letter-spacing: -0.01em

.popup-body
  flex: 1
  min-height: 0
  padding: 0 16px 16px

.popup-tip
  margin: 0
  padding: 12px 16px 16px
  color: #60758c
  background: #ffffff
  border-top: 1px solid rgba(214, 217, 220, 0.8)
  text-decoration: none
</style>
