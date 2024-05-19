<template>
  <div :style='{maxWidth: "600px"}'>
    <h5 class='text-brown-8' :style='{fontWeight: 600, margin: "16px"}'>
      Validate Account
    </h5>
    <p class='text-brown-8'>
      <q-icon name='info' class='text-blue-6' size='20px' />
      CheCko need you to input your account which is backup in last step again to confirm you store them correctly.
    </p>
    <div :style='{margin: "4px 0", fontWeight: 500, lineHeight: "32px"}' class='text-brown-10 text-left row'>
      <span>Private Key</span>
      <q-space />
      <q-btn
        flat
        dense
        size='0.8rem'
        :label='displayHideText'
        @click='display = !display'
        color='blue-6'
      />
    </div>
    <q-input
      outlined
      dense
      v-model='privateKey'
      @blur='onPrivateKeyBlur'
      @focus='onPrivateKeyFocus'
      :error='privateKeyError'
      hide-bottom-space
      :type='display ? "text" : "password"'
    />
    <div :style='{margin: "4px 0", fontWeight: 500, lineHeight: "32px"}' class='text-brown-10 text-left'>
      Address
    </div>
    <q-input
      outlined
      dense
      v-model='publicKey'
      hide-bottom-space
      disable
    />
    <div :style='{margin: "4px 0", fontWeight: 500, lineHeight: "32px"}' class='text-brown-10 text-left'>
      Initialization Microchain ID
    </div>
    <q-input
      outlined
      dense
      v-model='microchainId'
      @blur='onMicrochainIdBlur'
      @focus='onMicrochainIdFocus'
      :error='microchainIdError'
      hide-bottom-space
    />
    <div :style='{margin: "4px 0", fontWeight: 500, lineHeight: "32px"}' class='text-brown-10 text-left'>
      Open Chain Message ID
    </div>
    <q-input
      outlined
      dense
      v-model='messageId'
      @blur='onMessageIdBlur'
      @focus='onMessageIdFocus'
      :error='messageIdError'
      hide-bottom-space
    />
  </div>
</template>

<script setup lang="ts">
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { _hex } from 'src/utils'
import { ref, watch } from 'vue'

const privateKey = ref('')
const publicKey = defineModel<string>('publicKey')
const microchainId = ref('')
const messageId = ref('')
const display = ref(false)
const displayHideText = ref('Display')
const error = defineModel<boolean>('error', { default: true })
const privateKeyError = ref(false)
const microchainIdError = ref(false)
const messageIdError = ref(false)

watch(display, () => {
  displayHideText.value = display.value ? 'Hide' : 'Display'
})

const onPrivateKeyBlur = () => {
  privateKeyError.value = privateKey.value.length !== 64
}

const onPrivateKeyFocus = () => {
  privateKeyError.value = false
}

const onMicrochainIdBlur = () => {
  microchainIdError.value = microchainId.value.length !== 64
}

const onMicrochainIdFocus = () => {
  microchainIdError.value = false
}

const onMessageIdBlur = () => {
  messageIdError.value = messageId.value.length !== 88
}

const onMessageIdFocus = () => {
  messageIdError.value = false
}

watch([privateKeyError, microchainIdError, messageIdError], () => {
  error.value = privateKeyError.value || microchainIdError.value || messageIdError.value
})

watch(privateKey, () => {
  try {
    publicKey.value = _hex.toHex(Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey.value))).public().to_bytes().bytes)
  } catch (e) {
    // TODO
  }
})

</script>
