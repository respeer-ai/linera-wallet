<template>
  <div class='text-center full-height'>
    <div :style='{ height: "calc(100% - " + actionHeight + "px" + ")" }'>
      <div v-if='step === 1' class='full-height'>
        <OwnerSelector v-model='owner' />
      </div>
      <div v-if='step === 2' class='full-height'>
        <MicrochainSelector :owner='owner?.owner' v-model='microchain' />
      </div>
      <div v-if='step === 3' class='full-height page-x-padding'>
        <div class='selector-y-padding'>
          <CheckboxView
            :text='$t("MSG_ACCESS_ALLOWED_ACCOUNT_INFORMATION")'
            :caption='`Requested now for ${shortid.shortId(owner?.address, 4)}`'
            v-model='allowCheckAccount'
          />
        </div>
      </div>
      <div v-if='step === 4' class='full-height'>
        <ProcessingView :processing='processing' />
      </div>
    </div>
    <div v-if='step < 4' class='extra-bottom-margin page-x-padding'>
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
        class='btn btn-alt full-width vertical-items-margin'
        @click='onCancelClick'
        no-caps
      />
      <q-resize-observer @resize='onActionResize' />
    </div>
  </div>
  <OriginRpcMicrochainBridge ref='originRpcMicrochainBridge' />
  <RpcAuthBridge ref='rpcAuthBridge' />
  <DbMicrochainBridge ref='dbMicrochainBridge' />
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { computed, onMounted, ref, watch } from 'vue'
import { shortid } from 'src/utils'
import { commontypes } from 'src/types'
import { db } from 'src/model'

import OwnerSelector from '../selector/OwnerSelector.vue'
import MicrochainSelector from '../selector/MicrochainSelector.vue'
import CheckboxView from '../CheckboxView.vue'
import ProcessingView from '../../processing/ProcessingView.vue'
import OriginRpcMicrochainBridge from '../../bridge/db/OriginRpcMicrochainBridge.vue'
import RpcAuthBridge from '../../bridge/db/RpcAuthBridge.vue'
import DbMicrochainBridge from '../../bridge/db/MicrochainBridge.vue'

const step = ref(1)

const allowCheckAccount = ref(false)
const origin = computed(() => localStore.popup.popupOrigin)
const method = computed(() => localStore.popup._popupRequest)
const respond = computed(() => localStore.popup._popupRespond)
const processing = ref(false)

const title = defineModel<string>('title')

const owner = ref(undefined as unknown as db.Owner)
const microchain = ref(undefined as unknown as db.Microchain)

const originRpcMicrochainBridge = ref<InstanceType<typeof OriginRpcMicrochainBridge>>()
const rpcAuthBridge = ref<InstanceType<typeof RpcAuthBridge>>()
const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()

const onNextStepClick = async () => {
  step.value += 1
  if (step.value === 3) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await originRpcMicrochainBridge.value?.createOriginRpcMicrochain(
      localStore.popup.popupOrigin,
      owner.value?.address,
      microchain.value?.microchain
    )
  }
  if (step.value === 4) {
    processing.value = true
    setTimeout(() => {
      processing.value = false
      void respond.value?.({
        approved: true
      } as commontypes.ConfirmationPopupResponse)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      void rpcAuthBridge.value?.createRpcAuth(origin.value, owner.value?.address, method.value, undefined, undefined, true)
      localStore.popup.removeRequest(localStore.popup.popupRequestId)
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
    return owner.value !== undefined
  }
  if (step.value === 2) {
    return microchain.value !== undefined
  }
  if (step.value === 3) {
    return allowCheckAccount.value
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

onMounted(async () => {
  title.value = 'Select Linera account'
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const rpcMicrochain = await originRpcMicrochainBridge.value?.getOriginRpcMicrochain(origin.value) as db.OriginRpcMicrochain
  if (!rpcMicrochain) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  microchain.value = await dbMicrochainBridge.value?.getMicrochain(rpcMicrochain.microchain) as db.Microchain
})

watch(step, () => {
  switch (step.value) {
    case 1: title.value = 'Select account'; return
    case 2: title.value = 'Select microchain'; return
    case 3: title.value = 'Permissions'; return
    case 4: title.value = 'Authenticating'
  }
})

</script>
