<template>
  <div>
    <div class='tip warn warn-bg text-left row'>
      <q-icon name='bi-exclamation-triangle-fill' color='red-8' size='24px' />
      <div class='tip-text page-item-x-margin-left'>
        You should understand when you click this button, it will clear all of the data in your storage including the wallet configuration and accounts data!
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
        Confirming
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
    window.location.pathname = localStore.setting.formalizePath('/')
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
