<template>
  <div class='text-center' :style='{height: "100%"}'>
    <div
      v-if='step === 1'
      :style='{
        height: "calc(100% - " + actionHeight + "px" + ")"
      }'
    >
      <div>
        <div class='text-bold text-brown-10' :style='{fontSize: "24px", margin: "12px 0 0 0"}'>
          Sign message
        </div>
        <q-resize-observer @resize='onHeaderResize' />
      </div>
      <div
        :style='{
          padding: "12px 0 12px 0",
          borderRadius: "16px",
          height: "calc(100% - " + headerHeight + "px" + ")"
        }'
        class='flex justify-center items-center'
      >
        <q-card bordered flat :style='{width: "100%", height: "100%", padding: "16px", wordBreak: "break-all", wordWrap: "break-word", whiteSpace: "pre-wrap", overflow: "scroll"}' class='text-left'>
          <div class='text-black text-bold' :style='{fontSize: "16px"}'>
            Account
          </div>
          <div :style='{margin: "8px 0 16px 0"}'>
            {{ publicKey }}
          </div>
          <div class='text-black text-bold' :style='{fontSize: "16px"}'>
            Content
          </div>
          <div :style='{margin: "8px 0 16px 0"}'>
            {{ utf8Content }}
          </div>
          <div class='text-black text-bold' :style='{fontSize: "16px"}'>
            Encoded
          </div>
          <div :style='{margin: "8px 0 16px 0"}'>
            {{ hexContent }}
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
          Confirm password
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
        <q-card :style='{width: "100%", padding: "16px"}'>
          <InputPassword v-model:password='password' v-model:error='passwordError' />
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
          Signing
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
        :disable='!forwardable()'
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
import { computed, onMounted, ref, watch } from 'vue'
import { _hex } from 'src/utils'
import { commontypes } from 'src/types'
import type { Json } from '@metamask/utils'
import { Web3 } from 'web3'
import { Berith, Ed25519SigningKey, Memory } from '@hazae41/berith'

import InputPassword from 'src/components/InputPassword.vue'

const _wallet = wallet.useWalletStore()
const step = ref(1)
const allowCheckAccount = ref(false)
const _popup = popup.usePopupStore()
const origin = computed(() => _popup.popupOrigin)
const method = computed(() => _popup._popupRequest)
const respond = computed(() => _popup._popupRespond)
const request = computed(() => _popup._popupPayload.data.request.request)
const account = computed(() => (request.value.params as Json[])?.[0]?.toString())
const publicKey = ref(account.value || '')
const hexContent = computed(() => (request.value.params as Json[])?.[1]?.toString())
const utf8Content = computed(() => Web3.utils.hexToUtf8(hexContent.value?.toString() || ''))
const password = ref('')
const passwordVerified = ref(false)
const passwordError = ref(false)
const processing = ref(false)
const _auth = auth.useAuthStore()

watch(passwordError, () => {
  onCancelClick()
})

const signResponse = () => {
  const _account = _wallet.account(publicKey.value)
  if (!_account) {
    return onCancelClick()
  }
  const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(_account.privateKey)))
  const bytes = Web3.utils.hexToBytes(hexContent.value as string)
  const signature = Web3.utils.bytesToHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)
  processing.value = true
  setTimeout(() => {
    processing.value = false
    void respond.value?.({
      approved: true,
      message: signature
    } as commontypes.ConfirmationPopupResponse)
    _auth.addAuth(origin.value, method.value)
    _popup.removeRequest(_popup.popupRequestId)
  }, 2000)
}

const onNextStepClick = () => {
  step.value += 1
  if (step.value === 2) {
    if (!_wallet._decrypted) {
      return _wallet.loadPassword(() => {
        _wallet.verifyPassword(password.value, () => {
          passwordVerified.value = true
        }, () => {
          // TODO
        })
      })
    }
    const _account = _wallet.account(publicKey.value)
    if (_account) step.value += 1
  }
  if (step.value === 3) {
    if (_wallet._decrypted) {
      return signResponse()
    }
    _wallet.load(password.value, () => {
      signResponse()
    }, () => {
      onCancelClick()
    })
  }
}

watch(password, () => {
  _wallet.loadPassword(() => {
    _wallet.verifyPassword(password.value, () => {
      passwordVerified.value = true
    }, () => {
      // TODO
    })
  })
})

const onCancelClick = () => {
  void respond.value?.({
    approved: false,
    message: 'Canceled by user'
  } as commontypes.ConfirmationPopupResponse)
  _popup.removeRequest(_popup.popupRequestId)
}

const forwardable = () => {
  if (step.value === 1) {
    return publicKey.value?.length > 0
  }
  if (step.value === 2) {
    return passwordVerified.value
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

watch(account, () => {
  _wallet.loadWithoutDecrypt(() => {
    publicKey.value = _wallet.displayAddress(_wallet.publicKeyByPrefix(account.value as string) as string)
  })
})

onMounted(async () => {
  await Berith.initBundledOnce()
  _wallet.loadWithoutDecrypt(() => {
    publicKey.value = _wallet.displayAddress(_wallet.publicKeyByPrefix(account.value as string) as string)
  })
})

</script>
