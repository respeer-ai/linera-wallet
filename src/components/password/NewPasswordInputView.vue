<template>
  <div class='full-width text-center flex items-center justify-center'>
    <div class='row fill-parent'>
      <q-space />
      <div :style='{width: "400px"}' class='text-left'>
        <div :style='{margin: "4px 0", lineHeight: "32px"}' class='row'>
          <span :style='{marginRight: "4px"}' class='text-bold'>{{ $t('MSG_NEW_PASSWORD') }}</span>
          <q-icon
            name='bi-question-circle-fill' size='12px' class='cursor-pointer' color='grey-6'
            :style='{marginTop: "10px", marginLeft: "2px"}'
          >
            <q-tooltip>{{ $t('MSG_AT_LEAST_8_LETTERS_WITH_BRACKETS') }}</q-tooltip>
          </q-icon>
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
          {{ $t('MSG_CONFIRM_PASSWORD') }}
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

const validatePassword = (password: string): boolean => {
  if (password.length < 8 || password.length > 20) {
    return false
  }

  const reg1 = /^[A-Za-z0-9!@#$%^&*()_+]+$/
  if (!reg1.test(password)) {
    return false
  }

  const reg2 = /[A-Za-z]+/
  if (!reg2.test(password)) {
    return false
  }

  const reg3 = /[0-9]+/
  if (!reg3.test(password)) {
    return false
  }

  /*
  const reg4 = /[!@#$%^&*()_+]+/
  if (!reg4.test(password)) {
    return false
  }
  */

  return true
}

watch([password, confirmPassword], () => {
  passwordError.value = password.value === undefined || !validatePassword(password.value)
  confirmPasswordError.value = confirmPassword.value === undefined || !validatePassword(confirmPassword.value)
  error.value = password.value !== confirmPassword.value
})

</script>
