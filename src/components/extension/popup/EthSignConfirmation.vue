<template>
  <div class='text-center' :style='{height: "100%"}'>
    <div :style='{ height: "calc(100% - " + (step !== 2 ? actionHeight : 0) + "px" + ")" }'>
      <div v-if='step === 1' class='full-height overflow-scroll'>
        <SignInfoView
          :public-key='publicKey'
          :utf8-content='utf8Content'
          :hex-content='(hexContent as string)'
        />
      </div>
      <div v-if='step === 2' class='full-height page-x-padding'>
        <VerifyPassword
          :show-title='false' @verified='onPasswordVerified' @error='onVerifyPasswordError' v-model:password='password'
          :check-login-timeout='true'
        />
      </div>
      <div v-if='step === 3' class='full-height'>
        <ProcessingView :processing='processing' />
      </div>
    </div>
    <div v-if='step < 3 && step !== 2' class='page-x-padding'>
      <q-btn
        flat
        rounded
        :label='$t("MSG_CONTINUE")'
        class='btn full-width vertical-items-margin'
        @click='onNextStepClick'
        :disable='!forwardable()'
        no-caps
      />
      <q-btn
        flat
        rounded
        outlined
        :label='$t("MSG_CANCEL")'
        class='btn btn-alt full-width vertical-items-margin extra-bottom-margin'
        @click='onCancelClick'
        no-caps
      />
      <q-resize-observer @resize='onActionResize' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { computed, onMounted, ref, watch } from 'vue'
import { _hex } from 'src/utils'
import { commontypes } from 'src/types'
import type { Json } from '@metamask/utils'
import { Web3 } from 'web3'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { dbModel } from 'src/model'

import VerifyPassword from '../..//password/VerifyPassword.vue'
import SignInfoView from '../SignInfoView.vue'
import ProcessingView from '../../processing/ProcessingView.vue'
import { dbBridge } from 'src/bridge'

const step = ref(1)
const origin = computed(() => localStore.popup.popupOrigin)
const method = computed(() => localStore.popup._popupRequest)
const respond = computed(() => localStore.popup._popupRespond)
const request = computed(() => localStore.popup._popupPayload?.data?.request?.request)
const account = computed(() => (request.value?.params as Json[])?.[0]?.toString())
const publicKey = ref(account.value || '')
const hexContent = computed(() => (request.value?.params as Json[])?.[1]?.toString())
const utf8Content = computed(() => Web3.utils.hexToUtf8(hexContent.value?.toString() || ''))
const password = ref('')
const passwordVerified = ref(false)
const processing = ref(false)

const title = defineModel<string>('title')

const onVerifyPasswordError = () => {
  onCancelClick()
}

const signResponse = async () => {
  const _account = await dbBridge.Owner.ownerWithPublicKeyPrefix(publicKey.value) as dbModel.Owner
  if (!_account) {
    return onCancelClick()
  }
  const privateKey = dbModel.privateKey(_account, password.value)
  console.log(_account, password.value, privateKey)
  const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey)))
  const bytes = Web3.utils.hexToBytes(hexContent.value as string)
  const signature = Web3.utils.bytesToHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)
  setTimeout(() => {
    processing.value = false
    void respond.value?.({
      code: 0,
      message: signature
    } as commontypes.PopupResponse)
    void dbBridge.RpcAuth.create(origin.value, publicKey.value, method.value)
    localStore.popup.removeRequest(localStore.popup.popupRequestId)
  }, 2000)
}

const onPasswordVerified = async () => {
  passwordVerified.value = true
  step.value += 1
  processing.value = true
  await signResponse()
}

const onNextStepClick = () => {
  step.value += 1
}

const onCancelClick = () => {
  void respond.value?.({
    code: -1,
    message: 'Canceled by user'
  } as commontypes.PopupResponse)
  localStore.popup.removeRequest(localStore.popup.popupRequestId)
}

const forwardable = () => {
  if (step.value === 1) {
    return publicKey.value?.length > 0
  }
  if (step.value === 2) {
    return passwordVerified.value
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
  title.value = 'Sign message'
})

watch(step, () => {
  switch (step.value) {
    case 1: title.value = 'Sign message'; return
    case 2: title.value = 'Confirm password'; return
    case 3: title.value = 'Signing'
  }
})

</script>
