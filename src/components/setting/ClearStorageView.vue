<template>
  <div>
    <div class='tip warn warn-bg text-left row'>
      <q-icon name='bi-exclamation-triangle-fill' color='red-8' size='24px' />
      <div class='tip-text page-item-x-margin-left'>
        {{ $t('MSG_UNDERSTAND_PRESS_WILL_CLEAR_ALL_DATA') }}
      </div>
    </div>
    <q-btn
      :loading='confirmedSeconds > 0 && confirmedSeconds < confirmSeconds'
      :percentage='confirmedSeconds * 100 / confirmSeconds'
      flat class='btn btn-alt vertical-menus-margin full-width' label='Long press to clear storage'
      no-caps
      v-touch-repeat.mouse='onConfirmClick'
      @mouseup='onConfirmCanceled'
    >
      <template #loading>
        <q-spinner-gears class='on-left' />
        {{ $t('MSG_CONFIRMING') }}
      </template>
    </q-btn>
  </div>
</template>

<script setup lang='ts'>
import { dbBase, dbWallet } from 'src/controller'
import { localStore } from 'src/localstores'
import { ref } from 'vue'

const confirmSeconds = ref(10)
const confirmedSeconds = ref(0)

const onConfirmClick = async () => {
  confirmedSeconds.value++
  if (confirmSeconds.value === confirmedSeconds.value) {
    await dbWallet.delete()
    await dbBase.delete()
    // TODO: verify password and backup database here
    let pathname = localStore.setting.formalizePath('/')
    let hash = ''
    if (document.URL.startsWith('chrome-extension://')) {
      pathname = '/www/index.html'
      hash = '#/extension/onboarding'
    }
    if (hash.length > 0) {
      window.location.hash = hash
    }
    window.location.pathname = pathname
  }
}

const onConfirmCanceled = () => {
  confirmedSeconds.value = 0
}

</script>
