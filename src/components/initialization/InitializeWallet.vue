<template>
  <div class='fill-parent text-center onboarding-container shadow-1 onboarding-padding'>
    <q-stepper
      flat
      v-model='step'
      done-color='green-6'
      animated
      alternative-labels
      :header-class='extensionMode ? "hide" : ""'
      :class='[ extensionMode ? "stepper-expand" : "" ]'
    >
      <q-step
        :name='1'
        title='Create password'
        :done='step > 1'
      >
        <NewPassword v-if='!extensionMode' v-model:password='password' v-model:error='passwordError' />
        <ExtensionNewPassword v-else v-model:password='password' v-model:error='passwordError' />
      </q-step>
      <q-step
        :name='2'
        title='Secure wallet'
        :done='step > 2'
      >
        <InitializeAccount
          v-if='!extensionMode' :password='password' v-model:show-inner-action-btn='showInnerActionBtn' v-model:mnemonic='mnemonic'
          v-model:public-key='publicKey' v-model:private-key='privateKey'
        />
        <ExtensionInitializeAccount v-else :password='password' />
      </q-step>
      <q-step
        :name='3'
        title='Validate recovery'
        :done='step > 3'
      >
        <ValidateAccount v-if='!extensionMode' :mnemonic='mnemonic' v-model='mnemonicValid' />
        <ExtensionValidateAccount v-else v-model:password='password' v-model:error='passwordError' />
      </q-step>
    </q-stepper>
    <div v-if='!showInnerActionBtn' class='row'>
      <q-space />
      <div class='onboarding-btns row'>
        <q-btn
          flat
          class='text-brown-10 bg-red-2'
          :style='{borderRadius: "16px", width: "100%", maxWidth: "400px", margin: "32px 0 0 0"}'
          :label='btnText'
          :disable='!canGotoNext()'
          @click='onNextStepClick'
          no-caps
        />
      </div>
      <q-space />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue'
import { wallet, oneshotsetting } from 'src/localstores'
import { useRouter } from 'vue-router'

import NewPassword from 'src/components/password/NewPassword.vue'
import ExtensionNewPassword from 'src/components/extension/NewPassword.vue'
import InitializeAccount from 'src/components/account/InitializeAccount.vue'
import ExtensionInitializeAccount from 'src/components/extension/InitializeAccount.vue'
import ValidateAccount from 'src/components/account/ValidateAccount.vue'
import ExtensionValidateAccount from 'src/components/extension/ValidateAccount.vue'

const step = ref(1)
const password = ref('')
const passwordError = ref(false)
const publicKey = ref('')
const privateKey = ref('')
const mnemonic = ref('')
const mnemonicValid = ref(false)
const showInnerActionBtn = ref(false)

const _wallet = wallet.useWalletStore()
const router = useRouter()
const setting = oneshotsetting.useSettingStore()
const extensionMode = computed(() => setting.extensionMode)

const canGotoNext = () => {
  switch (step.value) {
    case 1:
      return !passwordError.value && password.value.length
    case 3:
      return mnemonicValid.value
    default:
      return true
  }
}

const btnText = computed(() => {
  switch (step.value) {
    case 1:
      return 'Create a new wallet'
    case 2:
      return 'Validate secret recovery phrase'
    case 3:
      return 'Linera now'
  }
  return 'Next'
})

const savePassword = () => {
  _wallet.savePassword(password.value, () => {
    step.value++
  })
}

const saveAccount = () => {
  _wallet.addAccount(publicKey.value, privateKey.value, password.value, () => {
    _wallet.selectAddress(publicKey.value)
    void router.push({ path: '/accounts' })
  })
}

const onNextStepClick = () => {
  switch (step.value) {
    case 1:
      savePassword()
      break
    case 2:
      step.value++
      break
    case 3:
      saveAccount()
      break
  }
}

</script>
