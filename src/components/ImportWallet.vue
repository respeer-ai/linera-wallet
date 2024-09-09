<template>
  <div class='text-center full-width'>
    <q-stepper
      flat
      v-model='step'
      active-color='brown-8'
      inactive-color='brown-4'
      done-color='green-6'
      animated
      alternative-labels
      :header-class='extensionMode ? "hide" : ""'
      :class='[ extensionMode ? "stepper-expand" : "" ]'
    >
      <q-step
        :name='1'
        title='Create Password'
        :done='step > 1'
      >
        <NewPassword v-if='!extensionMode' v-model:password='password' v-model:error='passwordError' />
        <ExtensionNewPassword v-else v-model:password='password' v-model:error='passwordError' />
      </q-step>
      <q-step
        :name='2'
        title='Import Account'
        :done='step > 2'
      >
        <ImportAccount v-if='!extensionMode' v-model:error='accountError' v-model:public-key='publicKey' />
        <ExtensionImportAccount v-else v-model:password='password' v-model:error='passwordError' />
      </q-step>
    </q-stepper>
    <q-btn
      flat
      class='text-brown-10 bg-red-2'
      :style='{borderRadius: "16px", width: "100%", maxWidth: "400px", margin: "32px 0 0 0"}'
      :label='btnText'
      :disable='!canGotoNext()'
      @click='onNextStepClick'
    />
  </div>
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue'
import { localStore } from 'src/localstores'
import { useRouter } from 'vue-router'

import NewPassword from 'src/components/password/NewPassword.vue'
import ExtensionNewPassword from 'src/components/extension/NewPassword.vue'
import ImportAccount from 'src/components/ImportAccount.vue'
import ExtensionImportAccount from 'src/components/extension/ImportAccount.vue'

const step = ref(1)
const password = ref('')
const passwordError = ref(false)
const accountError = ref(true)
const publicKey = ref('')

const router = useRouter()
const extensionMode = computed(() => localStore.oneShotSetting.extensionMode)

const canGotoNext = () => {
  switch (step.value) {
    case 1:
      return !passwordError.value && password.value.length
    case 2:
      return !accountError.value
    default:
      return true
  }
}

const btnText = computed(() => {
  switch (step.value) {
    case 1:
      return 'Save Password'
    case 2:
      return 'Import Account'
  }
  return 'Next'
})

const savePassword = () => {
  localStore.wallet.savePassword(password.value, () => {
    step.value++
  })
}

const validateAccount = () => {
  const account = localStore.wallet.account(publicKey.value)
  if (account) {
    // TODO: init wallet
    void router.push({ path: '/microchains' })
    return
  }
  localStore.notification.pushNotification({
    Title: 'Validate Account',
    Message: 'Please provide correct account information, or regenerate a new one',
    Popup: true,
    Type: localStore.notify.NotifyType.Error
  })
}

const onNextStepClick = () => {
  switch (step.value) {
    case 1:
      savePassword()
      break
    case 2:
      validateAccount()
      break
  }
}

</script>
