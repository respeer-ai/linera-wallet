<template>
  <div :class='[ "full-width text-center onboarding-container", localStore.setting.extensionMode ? "" : "onboarding-stepper-padding" ]'>
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
        :title='$t("MSG_CREATE_PASSWORD")'
        :done='step > 1'
      >
        <NewPassword v-model:password='password' v-model:error='passwordError' />
      </q-step>
      <q-step
        :name='2'
        :title='$t("MSG_SECURE_WALLET")'
        :done='step > 2'
      >
        <InitializeAccount
          :password='password' v-model:show-inner-action-btn='showInnerActionBtn' v-model:mnemonic='mnemonic'
          v-model:private-key='privateKeyHex'
        />
      </q-step>
      <q-step
        :name='3'
        :title='$t("MSG_VALIDATE_RECOVERY")'
        :done='step > 3'
      >
        <ValidateAccount :mnemonic='mnemonic' v-model='mnemonicValid' />
      </q-step>
    </q-stepper>
    <div v-if='!showInnerActionBtn' class='row page-x-padding'>
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
  </div>
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { localStore } from 'src/localstores'
import { useI18n } from 'vue-i18n'

import PasswordBridge from '../bridge/db/PasswordBridge.vue'

import NewPassword from 'src/components/password/NewPassword.vue'
import InitializeAccount from 'src/components/account/InitializeAccount.vue'
import ValidateAccount from 'src/components/account/ValidateAccount.vue'
import { dbBridge } from 'src/bridge'

// eslint-disable-next-line @typescript-eslint/unbound-method
const { t } = useI18n({ useScope: 'global' })

const step = ref(1)
const password = ref(undefined as unknown as string)
const passwordError = ref(false)
const privateKeyHex = ref('')
const mnemonic = ref('')
const mnemonicValid = ref(false)
const showInnerActionBtn = ref(false)

const passwordBridge = ref<InstanceType<typeof PasswordBridge>>()

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
      return t('MSG_CREATE_A_NEW_WALLET')
    case 2:
      return t('MSG_VALIDATE_SECURE_RECOVERY_PHRASE')
    case 3:
      return t('MSG_LINERA_NOW')
  }
  return t('MSG_NEXT')
})

const savePassword = async () => {
  await dbBridge.Password.save(password.value)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await dbBridge.LoginTimestamp.save()
}

const saveAccount = async () => {
  await dbBridge.Owner.create(privateKeyHex.value, undefined, password.value)
  void router.push({ path: localStore.setting.formalizePath('/home') })
}

const onNextStepClick = async () => {
  switch (step.value) {
    case 1:
      step.value++
      break
    case 2:
      step.value++
      break
    case 3:
      await savePassword()
      await saveAccount()
      break
  }
}

</script>
