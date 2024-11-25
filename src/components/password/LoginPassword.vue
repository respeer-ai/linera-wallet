<template>
  <q-card flat class='full-width page-x-padding'>
    <h5 class='onboarding-page-title'>
      {{ $t('MSG_WELCOME_BACK') }}
    </h5>
    <p :style='{marginTop: "-12px"}'>
      {{ $t('MSG_THE_REAL_TIME_AND_REACTIVE_DWEB_AWAITS') }}
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
          class='btn full-width vertical-sections-margin'
          :label='$t("MSG_UNLOCK")'
          @click='onUnlockClick'
          :disable='password.length < 8 || passwordError'
          no-caps
        />
        <q-btn
          flat
          dense
          rounded
          class='text-blue-6 full-width'
          :label='$t("MSG_FORGET_PASSWORD")'
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import InputPassword from '../password/InputPassword.vue'
import PasswordBridge from '../bridge/db/PasswordBridge.vue'

import cheCkoLogo from 'src/assets/CheCko.png'

const { t } = useI18n({ useScope: 'global' })

const password = defineModel<string>('password', { default: '' })
const decryptedPassword = ref('')

const emit = defineEmits(['unlocked'])
const passwordError = ref(false)

const unlock = () => {
  if (password.value === decryptedPassword.value) return emit('unlocked')
  localStore.notification.pushNotification({
    Title: t('MSG_RESTORE_WALLET'),
    Message: t('MSG_FAILED_RESTORE_WALLET'),
    Popup: true,
    Type: localStore.notify.NotifyType.Error
  })
}

const onUnlockClick = () => {
  if (passwordError.value) return
  unlock()
}

const router = useRouter()

const onForgetPasswordClick = () => {
  void router.push({ path: localStore.setting.formalizePath('/resetwallet') })
}

</script>
