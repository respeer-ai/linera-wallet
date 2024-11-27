<template>
  <div class='text-center full-height'>
    <div :style='{ height: "calc(100% - " + (step !== 2 ? actionHeight : 0) + "px" + ")" }'>
      <div v-if='step === 1' class='full-height page-x-padding overflow-scroll'>
        <div class='selector-y-padding'>
          <CheckboxView
            :text='operation'
            :caption='`Requested now for ${shortid.shortId(publicKey || "", 4)}`'
            v-model='allowMutateWallet'
          />
          <CheckboxView
            text='Use the same selection for future requests'
            v-model='persistAuthentication'
          />
          <MutationInfoView
            :public-key='(publicKey as string)'
            :application-id='applicationId'
            :microchain-id='microchain'
            :graphql-query='graphqlQuery'
            :graphql-variables='graphqlVariables'
          />
        </div>
      </div>
      <div v-if='step === 2' class='full-height'>
        <ProcessingView :processing='processing' />
      </div>
      <div v-if='step === 3' class='full-height'>
        <div>Executing {{ popupOperation }}</div>
      </div>
    </div>
    <div v-if='step < 4 && step !== 2' class='page-x-padding'>
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
    <DbRpcAuthBridge ref='rpcAuthBridge' />
    <DbOriginRpcMicrochainBridge ref='dbOriginRpcMicrochainBridge' />
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { computed, onMounted, ref, watch } from 'vue'
import { shortid } from 'src/utils'
import { commontypes } from 'src/types'
import { lineraGraphqlMutationOperation, lineraGraphqlQuery, lineraGraphqlQueryApplicationId, lineraGraphqlQueryPublicKey, LineraOperation } from '../../../../src-bex/middleware/types'

import DbRpcAuthBridge from '../../bridge/db/RpcAuthBridge.vue'
import CheckboxView from '../CheckboxView.vue'
import ProcessingView from '../../processing/ProcessingView.vue'
import MutationInfoView from '../MutationInfoView.vue'
import DbOriginRpcMicrochainBridge from '../../bridge/db/OriginRpcMicrochainBridge.vue'
import { db } from 'src/model'

const step = ref(1)
const allowMutateWallet = ref(false)
const persistAuthentication = ref(false)
const respond = computed(() => localStore.popup._popupRespond)
const origin = computed(() => localStore.popup.popupOrigin)
const method = computed(() => localStore.popup._popupRequest)
const request = computed(() => localStore.popup._popupPayload.data)
const applicationId = computed(() => lineraGraphqlQueryApplicationId(request.value.request) as string)
const operation = computed(() => lineraGraphqlMutationOperation(request.value.request) as string)
const graphqlQuery = computed(() => lineraGraphqlQuery(request.value.request).query)
const graphqlVariables = computed(() => lineraGraphqlQuery(request.value.request).variables)
const publicKey = ref(lineraGraphqlQueryPublicKey(request.value.request))
const popupOperation = computed(() => localStore.popup._popupPrivData as LineraOperation)
const microchain = ref(undefined as unknown as string)
const processing = ref(false)

const rpcAuthBridge = ref<InstanceType<typeof DbRpcAuthBridge>>()
const dbOriginRpcMicrochainBridge = ref<InstanceType<typeof DbOriginRpcMicrochainBridge>>()

const title = defineModel<string>('title')

const createRpcAuth = async () => {
  const _respond = respond.value
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await rpcAuthBridge.value?.createRpcAuth(
      origin.value,
      publicKey.value as string,
      method.value,
      applicationId.value,
      operation.value,
      persistAuthentication.value
    )
    localStore.popup.removeRequest(localStore.popup.popupRequestId)
    void _respond?.({
      code: 0
    } as commontypes.PopupResponse)
  } catch (e) {
    void _respond?.({
      code: 0,
      message: (e as Error).message
    } as commontypes.PopupResponse)
  }
}

const onNextStepClick = async () => {
  step.value += 1
  if (step.value === 2) {
    processing.value = true
    await createRpcAuth()
    window.setTimeout(() => {
      processing.value = false
      step.value += 1
    }, 2000)
  }
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
    return publicKey.value?.length && allowMutateWallet.value
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
  title.value = 'Permissions'
  publicKey.value = lineraGraphqlQueryPublicKey(request.value.request)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const rpcMicrochain = await dbOriginRpcMicrochainBridge.value?.getOriginRpcMicrochain(origin.value) as db.OriginRpcMicrochain
  microchain.value = rpcMicrochain?.microchain
  // TODO: here the public key should be the same as rpcMicrochain
  if (!publicKey.value?.length) {
    publicKey.value = rpcMicrochain?.publicKey
  }
  if (publicKey.value !== rpcMicrochain?.publicKey) {
    console.log('Different public key may cause error when submit block')
  }
})

watch(step, () => {
  switch (step.value) {
    case 1: title.value = 'Permissions'; return
    case 2: title.value = 'Authenticating'; return
    case 3: title.value = 'Executing'
  }
})

</script>
