<template>
  <div class='full-width text-center onboarding-container onboarding-stepper-padding'>
    <q-stepper
      flat
      v-model='step'
      done-color='green-6'
      animated
      alternative-labels
      header-class='hide'
    >
      <q-step
        :name='1'
        title='Create password'
        :done='step > 1'
      >
        <NewPassword v-model:password='password' v-model:error='passwordError' />
      </q-step>
      <q-step
        :name='2'
        title='Secure wallet'
        :done='step > 2'
      >
        <InitializeAccount
          :password='password' v-model:show-inner-action-btn='showInnerActionBtn' v-model:mnemonic='mnemonic'
          v-model:public-key='publicKey' v-model:private-key='privateKey'
        />
      </q-step>
      <q-step
        :name='3'
        title='Validate recovery'
        :done='step > 3'
      >
        <ValidateAccount :mnemonic='mnemonic' v-model='mnemonicValid' />
      </q-step>
    </q-stepper>
    <div v-if='!showInnerActionBtn' class='row'>
      <q-space />
      <div class='onboarding-btns row'>
        <q-btn
          flat
          class='btn full-width vertical-menus-margin'
          :label='btnText'
          :disable='!canGotoNext()'
          @click='onNextStepClick'
          no-caps
        />
      </div>
      <q-space />
    </div>
    <PasswordBridge ref='passwordBridge' v-model:password='password' />
    <OwnerBridge ref='ownerBridge' />
  </div>
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

import PasswordBridge from '../bridge/db/PasswordBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'

import NewPassword from 'src/components/password/NewPassword.vue'
import InitializeAccount from 'src/components/account/InitializeAccount.vue'
import ValidateAccount from 'src/components/account/ValidateAccount.vue'

const step = ref(1)
const password = ref(undefined as unknown as string)
const passwordError = ref(false)
const publicKey = ref('')
const privateKey = ref('')
const mnemonic = ref('')
const mnemonicValid = ref(false)
const showInnerActionBtn = ref(false)

const passwordBridge = ref<InstanceType<typeof PasswordBridge>>()
const ownerBridge = ref<InstanceType<typeof OwnerBridge>>()

const router = useRouter()

const canGotoNext = () => {
  switch (step.value) {
    case 1:
      return !passwordError.value && password.value?.length
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

const savePassword = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await passwordBridge.value?.savePassword(password.value)
  step.value++
}

const saveAccount = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await ownerBridge.value?.createOwner(publicKey.value, privateKey.value)
  void router.push({ path: '/home' })
}

const onNextStepClick = async () => {
  switch (step.value) {
    case 1:
      await savePassword()
      break
    case 2:
      step.value++
      break
    case 3:
      await saveAccount()
      break
  }
}

</script>
