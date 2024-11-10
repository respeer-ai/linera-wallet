<template>
  <div class='text-center onboarding-container shadow-1'>
    <div class='onboarding-content full-width full-height page-x-padding extra-margin-bottom'>
      <div class='row vertical-menus-margin'>
        <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer' @click='onBackClick' />
        <q-space />
        <p class='text-center text-bold text-grey-9 selector-title'>
          {{ $t('MSG_RESET_WALLET') }}
        </p>
        <q-space />
        <div :style='{ width: "24px" }' />
      </div>
      <div class='full-width text-left vertical-items-margin'>
        <q-card class='bg-grey-2 page-x-padding selector-y-padding'>
          <q-checkbox v-model='passwordConfirmed'>
            {{ $t('MSG_RESET_WALLET_TIP_1') }}
          </q-checkbox>
        </q-card>
        <q-card class='bg-grey-2 page-x-padding selector-y-padding vertical-menus-margin'>
          <q-checkbox v-model='walletConfirmed'>
            {{ $t('MSG_RESET_WALLET_TIP_2') }}
          </q-checkbox>
        </q-card>
        <q-card class='bg-grey-2 page-x-padding selector-y-padding vertical-menus-margin'>
          <q-checkbox v-model='mnemonicConfirmed'>
            {{ $t('MSG_RESET_WALLET_TIP_3') }}
          </q-checkbox>
        </q-card>
      </div>
      <q-btn
        :loading='confirmedSeconds > 0 && confirmedSeconds < confirmSeconds'
        :percentage='confirmedSeconds * 100 / confirmSeconds'
        flat class='btn btn-alt vertical-sections-margin full-width' :label='$t("MSG_LONG_PRESS_RESET_WALLET")'
        no-caps
        v-touch-repeat.mouse='onConfirmClick'
        @mouseup='onConfirmCanceled'
        :disable='!passwordConfirmed || !walletConfirmed || !mnemonicConfirmed'
      >
        <template #loading>
          <q-spinner-gears class='on-left' />
          {{ $t('MSG_CONFIRMING') }}
        </template>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { localStore } from 'src/localstores'
import { ref } from 'vue'
import { dbBase, dbWallet } from 'src/controller'

const passwordConfirmed = ref(false)
const walletConfirmed = ref(false)
const mnemonicConfirmed = ref(false)

const router = useRouter()

const onBackClick = () => {
  void router.back()
}

const confirmSeconds = ref(10)
const confirmedSeconds = ref(0)

const onConfirmClick = async () => {
  confirmedSeconds.value++
  if (confirmSeconds.value === confirmedSeconds.value) {
    await dbWallet.delete()
    await dbBase.delete()
    // TODO: verify password and backup database here
    window.location.pathname = localStore.setting.formalizePath('/')
    if (window.location.pathname.includes('extension')) {
      return
    }
    if (document.URL.startsWith('chrome-extension://')) {
      window.location.pathname = '/www/index.html'
      window.location.hash = '#/extension/onboarding'
    }
  }
}

const onConfirmCanceled = () => {
  confirmedSeconds.value = 0
}

</script>
