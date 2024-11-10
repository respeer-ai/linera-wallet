<template>
  <div class='full-width text-center flex items-center justify-center'>
    <h5 class='onboarding-page-title'>
      {{ $t('MSG_CREATE_PASSWORD') }}
    </h5>
    <p>
      {{ $t('MSG_THIS_PASSWORD_WILL_UNLOCK_CHECKO_ON_THIS_DEVICE') }}
    </p>
    <NewPasswordInputView v-model:password='password' v-model:error='error' />
    <p class='text-center' :style='{margin: "24px 0 0 0"}' v-html='$t("MSG_BY_CONTINUE_YOU_UNDERSTAND_CHECKO_CANNOT_RECOVER_PASSWORD")' />
  </div>
</template>

<script setup lang='ts'>

import NewPasswordInputView from './NewPasswordInputView.vue'

const password = defineModel<string>('password', { default: '' })
const error = defineModel<boolean>('error', { default: false })

</script>
