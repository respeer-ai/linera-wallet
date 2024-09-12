<template>
  <q-card flat class='text-center fill-parent' :style='{padding: "24px", maxWidth: "400px", height: "340px"}'>
    <h5 :style='{fontWeight: 600, margin: "8px 0"}' class='text-brown-8'>
      {{ title }}
    </h5>
    <div :style='{margin: "40px 0 0 0"}'>
      <InputPassword v-model:password='shadowPassword' v-model:error='passwordError' />
    </div>
    <q-btn
      flat
      dense
      class='text-blue-6 bg-red-2'
      :style='{borderRadius: "16px", width: "100%", margin: "48px 0 0 0"}'
      label='Verify'
      @click='onVerifyClick'
      :disable='passwordError'
    />
    <q-btn
      flat
      class='text-brown-10'
      :style='{borderRadius: "16px", width: "100%"}'
      label='Cancel'
      @click='onCancelClick'
    />
  </q-card>
</template>

<script setup lang='ts'>
import { ref, toRef, watch } from 'vue'
import { localStore } from 'src/localstores'

import InputPassword from 'src/components/password/InputPassword.vue'

interface Props {
  title: string
}

const props = defineProps<Props>()
const title = toRef(props, 'title')

const password = defineModel<string>('password', { default: '' })
const shadowPassword = ref('')
const emit = defineEmits(['verified', 'error', 'cancel'])
const passwordError = ref(false)

watch(shadowPassword, () => {
  password.value = shadowPassword.value
})

const onVerifyClick = () => {
  localStore.wallet.verifyPassword(password.value, () => {
    emit('verified')
  }, () => {
    emit('error')
    localStore.notification.pushNotification({
      Title: 'Verify Password',
      Message: 'Fail to verify password. Please confirm you input correct password.',
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  })
}

const onCancelClick = () => {
  emit('cancel')
}

</script>
