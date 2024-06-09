<template>
  <div class='text-center' :style='{height: "100%"}'>
    <div
      v-if='step === 1'
      :style='{
        height: "calc(100% - " + actionHeight + "px" + ")"
      }'
    >
      <div>
        <div class='text-bold text-brown-10' :style='{fontSize: "24px", margin: "24px 0 0 0"}'>
          Mutate Linera Wallet
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
          <div v-if='publicKeys.length' :style='{width: "100%"}'>
            <q-radio
              v-model='publicKey'
              v-for='(_publicKey, index) in publicKeys'
              :key='_publicKey'
              :val='_publicKey'
              :style='{
                padding: "24px 12px",
                borderBottom: index < publicKeys.length - 1 ? "1px solid grey" : "",
                width: "100%"
              }'
              class='cursor-pointer'
            >
              <div class='row'>
                <q-img :src='lineraLogo' width='36px' height='36px' />
                <div :style='{margin: "0 0 0 16px"}' class='text-left'>
                  <div class='text-bold text-brown-10' :style='{fontSize: "18px"}'>
                    {{ shortid.shortId(_publicKey, 6) }}
                  </div>
                  <div class='text-brown-6'>
                    {{ _wallet.accountBalance(_publicKey, undefined) }} TLINERA
                  </div>
                </div>
              </div>
            </q-radio>
          </div>
          <div v-else :style='{width: "100%"}' class='row'>
            <q-space />
            <div :style='{lineHeight: "36px"}'>
              No account available.
            </div>
            <q-btn
              dense
              flat
              class='text-blue-6'
            >
              Create
            </q-btn>
            <q-space />
          </div>
        </q-card>
      </div>
    </div>
    <div
      v-if='step === 2'
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
                padding: "24px 12px",
                width: "100%"
              }'
              class='cursor-pointer'
              checked-icon='task_alt'
              unchecked-icon='highlight_off'
            >
              <div :style='{margin: "0 0 0 16px"}' class='text-left'>
                <div class='text-bold text-brown-10' :style='{fontSize: "18px"}'>
                  Change Linera account state (transfer, generate block, etc.)
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
      v-if='step === 3'
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
    <div v-if='step < 3'>
      <div class='text-brown-6' :style='{fontSize: "16px"}'>
        Only approve trusted application
      </div>
      <q-btn
        flat
        dense
        rounded
        label='Continue'
        class='text-brown-10 bg-red-2'
        :style='{
          margin: "16px 0 4px 0",
          width: "100%"
        }'
        @click='onNextStepClick'
        :disable='!forwadable()'
      />
      <q-btn
        flat
        dense
        rounded
        outlined
        label='Cancel'
        class='text-brown-10'
        :style='{
          margin: "4px 0 16px 0",
          width: "100%"
        }'
        @click='onCancelClick'
      />
      <q-resize-observer @resize='onActionResize' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { wallet, popup, auth } from 'src/localstores'
import { computed, ref } from 'vue'
import { shortid } from 'src/utils'
import { commontypes } from 'src/types'

import lineraLogo from '../../../assets/LineraLogo.png'

const _wallet = wallet.useWalletStore()
const publicKeys = computed(() => _wallet.publicKeys)
const publicKey = ref('')
const step = ref(1)
const allowCheckAccount = ref(false)
const _popup = popup.usePopupStore()
const respond = computed(() => _popup._popupRespond)
const origin = computed(() => _popup.popupOrigin)
const method = computed(() => _popup._popupRequest)
const processing = ref(false)
const _auth = auth.useAuthStore()

const onNextStepClick = () => {
  step.value += 1
  if (step.value === 3) {
    processing.value = true
    setTimeout(() => {
      processing.value = false
      void respond.value?.({
        approved: true
      } as commontypes.ConfirmationPopupResponse)
      _popup.removeRequest(_popup.popupRequestId)
      _auth.addAuth(origin.value, method.value)
    }, 2000)
  }
}

const onCancelClick = () => {
  void respond.value?.({
    approved: false
  } as commontypes.ConfirmationPopupResponse)
  _popup.removeRequest(_popup.popupRequestId)
}

const forwadable = () => {
  if (step.value === 1) {
    return publicKey.value.length > 0
  }
  if (step.value === 2) {
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

</script>
