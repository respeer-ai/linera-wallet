<template>
  <div class='full-width text-center flex items-center justify-center onboarding-content'>
    <h5 class='onboarding-page-title'>
      {{ $t('MSG_RESET_PASSWORD') }}
    </h5>
    <p>
      {{ $t('MSG_CHECKO_NEVER_STORE_YOUR_PASSWORD_OUTSIDE_WALLET') }}
    </p>
    <p>
      {{ $t('MSG_MAKE_SURE_STORED_ALL_BEFORE_CONTINUE') }}
    </p>
    <NewPasswordInputView v-model:password='password' v-model:error='error' />
    <p class='text-center vertical-sections-margin text-grey-6' v-html='$t("MSG_BY_CONTINUE_YOU_UNDERSTAND_CHECKO_CANNOT_RECOVER_PASSWORD")' />
  </div>
</template>

<script setup lang='ts'>

import NewPasswordInputView from './NewPasswordInputView.vue'

const password = defineModel<string>('password', { default: '' })
const error = defineModel<boolean>('error', { default: false })

</script>
