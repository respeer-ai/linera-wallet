<template>
  <q-card flat class='full-width page-x-padding'>
    <h5 class='onboarding-page-title'>
      Welcome back
    </h5>
    <p :style='{marginTop: "-12px"}'>
      The real time & reactive dWeb awaits.
    </p>
    <div>
      <q-img :src='cheCkoLogo' width='240px' :style='{margin: "80px 0 0 0"}' />
    </div>
    <div class='row'>
      <q-space />
      <div class='full-width'>
        <div :style='{margin: "80px 0 0 0"}'>
          <InputPassword v-model:password='password' v-model:error='passwordError' />
        </div>
        <q-btn
          flat
          class='btn full-width  vertical-sections-margin'
          label='Unlock'
          @click='onUnlockClick'
          :disable='password.length < 8 || passwordError'
          no-caps
        />
        <q-btn
          flat
          dense
          class='text-blue-6 full-width'
          label='Forget password?'
          @click='onForgetPasswordClick'
          no-caps
        />
      </div>
      <q-space />
    </div>
  </q-card>
  <PasswordBridge v-model:password='decryptedPassword' />
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { localStore } from 'src/localstores'

import InputPassword from '../password/InputPassword.vue'
import PasswordBridge from '../bridge/db/PasswordBridge.vue'

import cheCkoLogo from 'src/assets/CheCko.png'

const password = defineModel<string>('password', { default: '' })
const decryptedPassword = ref('')

const emit = defineEmits(['unlocked'])
const passwordError = ref(false)

const unlock = () => {
  if (password.value === decryptedPassword.value) return emit('unlocked')
  localStore.notification.pushNotification({
    Title: 'Restore Wallet',
    Message: 'Fail to restore wallet. Please confirm you input correct password.',
    Popup: true,
    Type: localStore.notify.NotifyType.Error
  })
}

const onUnlockClick = () => {
  if (passwordError.value) return
  unlock()
}

const onForgetPasswordClick = () => {
  // TODO: help user to reload private key again
}

</script>
