<template>
  <div :class='[ "text-center onboarding-container", localStore.setting.extensionMode ? "" : "onboarding-stepper-padding" ]'>
    <div class='bg-white'>
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
          :title='$t("MSG_CREATE_PASSWORD")'
          :done='step > 1'
        >
          <div class='row'>
            <q-space />
            <ResetPassword v-if='reset' v-model:password='password' v-model:error='passwordError' />
            <NewPassword v-else v-model:password='password' v-model:error='passwordError' />
            <q-space />
          </div>
        </q-step>
        <q-step
          :name='2'
          :title='$t("MSG_IMPORT_ACCOUNT")'
          :done='step > 2'
        >
          <div class='row'>
            <q-space />
            <ImportMnemonicView v-model='mnemonic' />
            <q-space />
          </div>
        </q-step>
      </q-stepper>
      <div class='full-width row'>
        <q-space />
        <div class='onboarding-btns extra-large-margin-bottom page-x-padding'>
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
  </div>
  <GenerateKey ref='generateKey' />
</template>

<script setup lang='ts'>
import { ref, computed, toRef } from 'vue'
import { localStore } from 'src/localstores'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import NewPassword from '../password/NewPassword.vue'
import ResetPassword from '../password/ResetPassword.vue'
import ImportMnemonicView from '../account/ImportMnemonicView.vue'
import GenerateKey from '../account/GenerateKey.vue'
import { dbBridge } from 'src/bridge'

const { t } = useI18n({ useScope: 'global' })

interface Props {
  reset?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  reset: false
})
const reset = toRef(props, 'reset')

const step = ref(1)
const password = ref('')
const passwordError = ref(false)
const mnemonic = ref([
  '', '', '', '', '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '', '', '', '', ''
] as string[])

const router = useRouter()

const generateKey = ref<InstanceType<typeof GenerateKey>>()

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
      return t('MSG_SAVE_PASSWORD')
    case 2:
      return t('MSG_IMPORT_ACCOUNT')
  }
  return t('MSG_NEXT')
})

const savePassword = () => {
  dbBridge.Password.save(password.value).then(() => {
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
    await dbBridge.Owner.create(v.publicKey, v.privateKey, undefined, password.value)
    void router.push({ path: localStore.setting.formalizePath('/home') })
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
