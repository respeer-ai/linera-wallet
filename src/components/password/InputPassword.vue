<template>
  <div class='fill-parent'>
    <div class='row'>
      <q-space />
      <div :style='{width: "100%"}' class='text-left'>
        <div :style='{margin: "4px 0", lineHeight: "32px"}' class='text-brown-10 row'>
          <span :style='{fontWeight: 500, marginRight: "4px"}'>Password</span>
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
      <q-space />
    </div>
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
