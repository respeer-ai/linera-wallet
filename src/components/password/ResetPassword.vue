<template>
  <div class='full-width text-center flex items-center justify-center onboarding-content'>
    <h5 class='onboarding-page-title'>
      Reset password
    </h5>
    <p>
      CheCko never store your password anywhere outside the wallet. If you really lose your password, the only way is to create a new password, then import your wallet with mnemonic or private keys.
    </p>
    <p>
      Before you continue, please make sure you have stored all of your account materials outside the wallet properly.
    </p>
    <NewPasswordInputView v-model:password='password' v-model:error='error' />
    <p class='text-center vertical-sections-margin text-grey-6'>
      By continue you understand CheCko cannot recover this password. <a href='#'>Learn more</a>
    </p>
  </div>
</template>

<script setup lang='ts'>

import NewPasswordInputView from './NewPasswordInputView.vue'

const password = defineModel<string>('password', { default: '' })
const error = defineModel<boolean>('error', { default: false })

</script>
