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
        <ImportMnemonicView v-model='mnemonic' />
      </q-step>
    </q-stepper>
    <div class='full-width row'>
      <q-space />
      <div class='onboarding-btns'>
        <q-btn
          flat
          class='btn full-width'
          :label='btnText'
          :disable='!canGotoNext()'
          @click='onNextStepClick'
          no-caps
        />
      </div>
      <q-space />
    </div>
  </div>
  <GenerateKey ref='generateKey' />
  <OwnerBridge ref='ownerBridge' />
  <PasswordBridge ref='passwordBridge' />
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue'
import { localStore } from 'src/localstores'
import { useRouter } from 'vue-router'

import NewPassword from 'src/components/password/NewPassword.vue'
import ImportMnemonicView from '../account/ImportMnemonicView.vue'
import GenerateKey from '../account/GenerateKey.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import PasswordBridge from '../bridge/db/PasswordBridge.vue'

const step = ref(1)
const password = ref('')
const passwordError = ref(false)
const mnemonic = ref([
  '', '', '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '', '', ''
] as string[])

const router = useRouter()

const generateKey = ref<InstanceType<typeof GenerateKey>>()
const ownerBridge = ref<InstanceType<typeof OwnerBridge>>()
const passwordBridge = ref<InstanceType<typeof PasswordBridge>>()

const canGotoNext = () => {
  switch (step.value) {
    case 1:
      return !passwordError.value && password.value.length
    case 2:
      return mnemonic.value.findIndex((v) => v.length === 0) < 0
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  passwordBridge.value?.savePassword(password.value).then(() => {
    // DO NOTHING
  }).catch((error) => {
    localStore.notification.pushNotification({
      Title: 'Save password',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: `Save password failed: ${error}`,
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  })
}

const validateAccount = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  generateKey.value?.createAccountWithMnemonic(mnemonic.value, password.value).then(async (val: unknown) => {
    const v = val as Record<string, string>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await ownerBridge.value?.createOwner(v.publicKey, v.privateKey, undefined, password.value)
    void router.push({ path: localStore.oneShotSetting.formalizePath('/home') })
  }).catch((error) => {
    localStore.notification.pushNotification({
      Title: 'Import account',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: `Import account failed: ${error}`,
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  })
}

const onNextStepClick = () => {
  switch (step.value) {
    case 1:
      step.value++
      break
    case 2:
      savePassword()
      validateAccount()
      break
  }
}

</script>
