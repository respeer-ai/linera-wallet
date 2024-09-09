<template>
  <q-card flat class='text-center fill-parent'>
    <h5 :style='{fontWeight: 600, margin: "8px 0"}' class='text-brown-8'>
      Welcome Back
    </h5>
    <p :style='{margin: "8px 0"}' class='text-brown-10'>
      Input your wallet password to restore accounts from secure storage.
    </p>
    <div>
      <q-img :src='cheCkoLogo' width='240px' :style='{margin: "80px 0 0 0"}' />
    </div>
    <div :style='{margin: "80px 0 0 0"}'>
      <InputPassword v-model:password='password' v-model:error='passwordError' />
    </div>
    <q-btn
      flat
      class='text-brown-10 bg-red-2'
      :style='{borderRadius: "16px", width: "100%", margin: "16px 0 0 0"}'
      label='Unlock'
      @click='onUnlockClick'
      :disable='password.length < 8 || passwordError'
    />
    <q-btn
      flat
      dense
      class='text-blue-6'
      :style='{borderRadius: "16px", width: "100%"}'
      label='Forget password?'
      @click='onForgetPasswordClick'
    />
  </q-card>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { localStore } from 'src/localstores'

import InputPassword from 'src/components/InputPassword.vue'

import cheCkoLogo from 'src/assets/CheCko.png'

const password = defineModel<string>('password', { default: '' })
const emit = defineEmits(['unlocked'])
const passwordError = ref(false)

const unlock = () => {
  localStore.wallet.load(password.value, () => {
    emit('unlocked')
  }, () => {
    localStore.notification.pushNotification({
      Title: 'Restore Wallet',
      Message: 'Fail to restore wallet. Please confirm you input correct password.',
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  })
}

const onUnlockClick = () => {
  if (passwordError.value) return
  if (!localStore.wallet.initialized) {
    localStore.wallet.loadPassword(() => {
      unlock()
    })
  } else {
    unlock()
  }
}

const onForgetPasswordClick = () => {
  // TODO: help user to reload private key again
}

</script>
