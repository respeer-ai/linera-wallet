<template>
  <div class='text-center full-height'>
    <div :style='{ height: "calc(100% - " + actionHeight + "px" + ")" }'>
      <div v-if='step === 1' class='full-height'>
        <OwnerSelector v-model='owner' />
      </div>
      <div v-if='step === 2' class='full-height'>
        <MicrochainSelector v-model='microchain' />
      </div>
      <div
        v-if='step === 3'
        :style='{
          height: "calc(100% - " + actionHeight + "px" + ")"
        }'
      >
        <div>
          <div class='text-bold text-brown-10' :style='{fontSize: "24px", margin: "24px 0 0 0"}'>
            Permissions
          </div>
          <q-resize-observer @resize='onHeaderResize' />
        </div>
        <div
          :style='{
            padding: "24px 0 36px 0",
            borderRadius: "16px",
            height: "calc(100% - " + headerHeight + "px" + ")"
          }'
          class='flex justify-center items-center'
        >
          <q-card :style='{width: "100%", padding: publicKeys.length ? "" : "48px 24px"}'>
            <div :style='{width: "100%"}'>
              <q-checkbox
                v-model='allowCheckAccount'
                :style='{
                  padding: "24px",
                  width: "100%"
                }'
                class='cursor-pointer'
                checked-icon='task_alt'
                unchecked-icon='highlight_off'
              >
                <div :style='{margin: "0 0 0 16px"}' class='text-left'>
                  <div class='text-bold text-brown-10' :style='{fontSize: "18px"}'>
                    Access allowed account information
                  </div>
                  <div class='text-brown-6'>
                    Requested now for {{ shortid.shortId(publicKey, 4) }}
                  </div>
                </div>
              </q-checkbox>
            </div>
          </q-card>
        </div>
      </div>
      <div
        v-if='step === 4'
        :style='{
          height: "calc(100% - " + actionHeight + "px" + ")"
        }'
      >
        <div>
          <div class='text-bold text-brown-10' :style='{fontSize: "24px", margin: "24px 0 0 0"}'>
            Authenticating
          </div>
          <q-resize-observer @resize='onHeaderResize' />
        </div>
        <div
          :style='{
            padding: "24px 0 36px 0",
            borderRadius: "16px",
            height: "calc(100% - " + headerHeight + "px" + ")"
          }'
          class='flex justify-center items-center'
        >
          <q-card :style='{height: "160px", width: "100%"}' flat>
            <q-inner-loading
              :showing='processing'
              class='text-red-4'
            >
              <q-spinner-facebook size='80px' />
            </q-inner-loading>
          </q-card>
        </div>
      </div>
    </div>
    <div v-if='step < 4' class='extra-bottom-margin page-x-padding'>
      <q-btn
        flat
        rounded
        label='Continue'
        class='btn full-width vertical-items-margin'
        @click='onNextStepClick'
        :disable='!forwadable()'
        no-caps
      />
      <q-btn
        flat
        rounded
        outlined
        label='Cancel'
        class='btn btn-alt full-width vertical-items-margin'
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
import { shortid } from 'src/utils'
import { commontypes } from 'src/types'
import { db } from 'src/model'

import OwnerSelector from '../selector/OwnerSelector.vue'
import MicrochainSelector from '../selector/MicrochainSelector.vue'

const publicKeys = ref([])
const publicKey = ref('')
const chainId = ref('')
const step = ref(1)
const allowCheckAccount = ref(false)
const origin = computed(() => localStore.popup.popupOrigin)
const method = computed(() => localStore.popup._popupRequest)
const respond = computed(() => localStore.popup._popupRespond)
const processing = ref(false)

const title = defineModel<string>('title')

const owner = ref(undefined as unknown as db.Owner)
const microchain = ref(undefined as unknown as db.Microchain)

const onNextStepClick = () => {
  step.value += 1
  if (step.value === 3) {
    localStore.auth.addChain(localStore.popup.popupOrigin, publicKey.value, chainId.value)
  }
  if (step.value === 4) {
    processing.value = true
    setTimeout(() => {
      processing.value = false
      void respond.value?.({
        approved: true
      } as commontypes.ConfirmationPopupResponse)
      localStore.auth.addAuth(origin.value, method.value)
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

const forwadable = () => {
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

const headerHeight = ref(0)
const actionHeight = ref(0)

const onHeaderResize = (size: Size) => {
  headerHeight.value = size.height
}
const onActionResize = (size: Size) => {
  actionHeight.value = size.height
}

onMounted(() => {
  title.value = 'Select Linera account'
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
