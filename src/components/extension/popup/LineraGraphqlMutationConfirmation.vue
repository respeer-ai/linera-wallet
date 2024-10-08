<template>
  <div class='text-center full-height'>
    <div :style='{ height: "calc(100% - " + actionHeight + "px" + ")" }'>
      <div v-if='step === 1' class='full-height page-x-padding'>
        <div class='selector-y-padding'>
          <CheckboxView
            text='Change Linera account state (transfer, generate block, etc.)'
            :caption='`Requested now for ${shortid.shortId(publicKey, 4)}`'
            v-model='allowMutateWallet'
          />
        </div>
        <div>{{ localStore.popup }}</div>
      </div>
      <div v-if='step === 2' class='full-height'>
        <ProcessingView :processing='processing' />
      </div>
    </div>
    <div v-if='step < 3 && step !== 2' class='page-x-padding'>
      <q-btn
        flat
        rounded
        label='Continue'
        class='btn full-width vertical-items-margin'
        @click='onNextStepClick'
        :disable='!forwardable()'
        no-caps
      />
      <q-btn
        flat
        rounded
        outlined
        label='Cancel'
        class='btn btn-alt full-width vertical-items-margin extra-bottom-margin'
        @click='onCancelClick'
        no-caps
      />
      <q-resize-observer @resize='onActionResize' />
    </div>
    <RpcAuthBridge ref='rpcAuthBridge' />
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { computed, onMounted, ref, watch } from 'vue'
import { shortid } from 'src/utils'
import { commontypes } from 'src/types'

import RpcAuthBridge from '../../bridge/db/RpcAuthBridge.vue'
import CheckboxView from '../CheckboxView.vue'
import ProcessingView from '../../processing/ProcessingView.vue'

const publicKey = ref('')
const step = ref(1)
const allowMutateWallet = ref(false)
const respond = computed(() => localStore.popup._popupRespond)
const origin = computed(() => localStore.popup.popupOrigin)
const method = computed(() => localStore.popup._popupRequest)
const processing = ref(false)

const rpcAuthBridge = ref<InstanceType<typeof RpcAuthBridge>>()

const title = defineModel<string>('title')

const onNextStepClick = () => {
  step.value += 1
  if (step.value === 2) {
    processing.value = true
    setTimeout(() => {
      processing.value = false
      const _respond = respond.value
      try {
        localStore.popup.removeRequest(localStore.popup.popupRequestId)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        void rpcAuthBridge.value?.createRpcAuth(origin.value, publicKey.value, method.value)
        void _respond?.({
          approved: true
        } as commontypes.ConfirmationPopupResponse)
      } catch (e) {
        void _respond?.({
          approved: false,
          message: (e as Error).message
        } as commontypes.ConfirmationPopupResponse)
      }
    }, 2000)
  }
}

const onCancelClick = () => {
  void respond.value?.({
    approved: false,
    message: 'Canceled by user'
  } as commontypes.ConfirmationPopupResponse)
  localStore.popup.removeRequest(localStore.popup.popupRequestId)
}

const forwardable = () => {
  if (step.value === 1) {
    return publicKey.value.length > 0
  }
  if (step.value === 2) {
    return allowMutateWallet.value
  }
  return false
}

interface Size {
  width: number
  height: number
}

const actionHeight = ref(0)

const onActionResize = (size: Size) => {
  actionHeight.value = size.height
}

onMounted(() => {
  title.value = 'Permissions'
})

watch(step, () => {
  switch (step.value) {
    case 1: title.value = 'Permissions'; return
    case 2: title.value = 'Authenticating'
  }
})

</script>
