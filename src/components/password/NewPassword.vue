<template>
  <div class='full-width text-center flex items-center justify-center'>
    <h5 class='onboarding-page-title'>
      Create password
    </h5>
    <p>
      This password will unlock your CheCko wallet only on this device. CheCko can not recover this password.
    </p>
    <div class='row fill-parent'>
      <q-space />
      <div :style='{width: "400px"}' class='text-left'>
        <div :style='{margin: "4px 0", lineHeight: "32px"}' class='row'>
          <span :style='{marginRight: "4px"}' class='text-bold'>New password</span> (At least 8 letters)
          <q-space />
          <q-btn
            flat
            dense
            size='0.8rem'
            :label='displayHideText'
            @click='display = !display'
            color='blue-6'
            no-caps
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
        <div :style='{margin: "4px 0", lineHeight: "32px"}' class='text-bold'>
          Confirm password
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
        <p class='text-center' :style='{margin: "24px 0 0 0"}'>
          By continue you understand CheCko cannot recover this password. <a href='#'>Learn more</a>
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
