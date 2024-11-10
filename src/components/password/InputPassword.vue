<template>
  <div class='text-left full-width'>
    <div class='row'>
      <span>{{ $t('MSG_PASSWORD') }}</span>
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
      :error='error'
      hide-bottom-space
      :type='display ? "text" : "password"'
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const password = defineModel<string>('password', { default: '' })
const display = ref(false)
const displayHideText = ref('Display')
const error = defineModel<boolean>('error', { default: false })

watch(display, () => {
  displayHideText.value = display.value ? 'Hide' : 'Display'
})

const onPasswordBlur = () => {
  error.value = password.value === undefined || password.value.length < 8
}

const resetError = () => {
  error.value = false
}

const onPasswordFocus = () => {
  resetError()
}

</script>
