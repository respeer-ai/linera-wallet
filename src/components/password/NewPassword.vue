<template>
  <div class='full-width text-center flex items-center justify-center'>
    <h5 class='onboarding-page-title'>
      Create password
    </h5>
    <p>
      This password will unlock your CheCko wallet only on this device. CheCko can not recover this password.
    </p>
    <NewPasswordInputView v-model:password='password' v-model:error='error' />
    <p class='text-center' :style='{margin: "24px 0 0 0"}'>
      By continue you understand CheCko cannot recover this password. <a href='#'>Learn more</a>
    </p>
  </div>
</template>

<script setup lang='ts'>

import NewPasswordInputView from './NewPasswordInputView.vue'

const password = defineModel<string>('password', { default: '' })
const error = defineModel<boolean>('error', { default: false })

</script>
