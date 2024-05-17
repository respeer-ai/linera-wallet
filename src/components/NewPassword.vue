<template>
  <div :style='{maxWidth: "600px"}'>
    <h5 class='text-brown-8' :style='{fontWeight: 600, margin: "16px"}'>
      Create Password
    </h5>
    <p class='text-brown-8'>
      <q-icon name='info' class='text-blue-6' size='20px' />
      With this password, you can protect your CheCko wallet. You should know that CheCko is not able to recover your wallet if you lose your password.
    </p>
    <div class='row'>
      <q-space />
      <div :style='{width: "400px"}' class='text-left'>
        <div :style='{margin: "4px 0", lineHeight: "32px"}' class='text-brown-10 row'>
          <span :style='{fontWeight: 500, marginRight: "4px"}'>New Password</span> (At least 8 letters)
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
          v-model='password'
          @blur='onPasswordBlur'
          @focus='onPasswordFocus'
          :error='passwordError'
          hide-bottom-space
          :type='display ? "text" : "password"'
        />
        <div :style='{margin: "4px 0", fontWeight: 500, lineHeight: "32px"}' class='text-brown-10'>
          Confirm Password
        </div>
        <q-input
          outlined
          dense
          v-model='confirmPassword'
          @blur='onConfirmPasswordBlur'
          @focus='onConfirmPasswordFocus'
          :error='confirmPasswordError'
          hide-bottom-space
          :type='display ? "text" : "password"'
        />
        <p class='text-brown-10 text-center' :style='{margin: "24px 0 0 0"}'>
          By continue you understand CheCko cannot recover this password and data which is protected by this password.
        </p>
      </div>
      <q-space />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const password = defineModel<string>('password', { default: '' })
const confirmPassword = ref('')
const display = ref(false)
const displayHideText = ref('Display')
const error = defineModel<boolean>('error', { default: false })
const passwordError = ref(false)
const confirmPasswordError = ref(false)

watch(display, () => {
  displayHideText.value = display.value ? 'Hide' : 'Display'
})

const updateError = () => {
  if (error.value) {
    passwordError.value = error.value
    confirmPasswordError.value = error.value
  }
}

const resetError = () => {
  confirmPasswordError.value = false
  passwordError.value = false
}

const onPasswordBlur = () => {
  updateError()
}

const onPasswordFocus = () => {
  resetError()
}

const onConfirmPasswordBlur = () => {
  updateError()
}

const onConfirmPasswordFocus = () => {
  resetError()
}

watch([password, confirmPassword], () => {
  passwordError.value = password.value === undefined || password.value.length < 8
  confirmPasswordError.value = confirmPassword.value?.length < 8
  error.value = password.value !== confirmPassword.value
})

</script>
