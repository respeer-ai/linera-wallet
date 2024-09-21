<template>
  <div class='text-center onboarding-container onboarding-stepper-padding'>
    <q-stepper
      flat
      v-model='step'
      active-color='brown-8'
      inactive-color='brown-4'
      done-color='green-6'
      animated
      alternative-labels
      header-class='hide'
    >
      <q-step
        :name='1'
        title='Create Password'
        :done='step > 1'
      >
        <NewPassword v-model:password='password' v-model:error='passwordError' />
      </q-step>
      <q-step
        :name='2'
        title='Import Account'
        :done='step > 2'
      >
        <ImportMnemonicView />
      </q-step>
    </q-stepper>
    <q-btn
      flat
      class='btn full-width'
      :label='btnText'
      :disable='!canGotoNext()'
      @click='onNextStepClick'
      no-caps
    />
  </div>
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue'
import { localStore } from 'src/localstores'
import { useRouter } from 'vue-router'

import NewPassword from 'src/components/password/NewPassword.vue'
import ImportMnemonicView from '../account/ImportMnemonicView.vue'

const step = ref(1)
const password = ref('')
const passwordError = ref(false)
const accountError = ref(true)
const publicKey = ref('')

const router = useRouter()

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
      return 'Save password'
    case 2:
      return 'Import account'
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
