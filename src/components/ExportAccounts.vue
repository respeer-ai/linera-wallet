<template>
  <q-btn
    outline
    rounded
    label='Export Accounts'
    @click='onExportAccountsClick'
    class='text-brown-10'
    :style='{
      width: "100%"
    }'
  />
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'

const onExportAccountsClick = () => {
  console.log(localStore.wallet.accounts)
  localStore.notification.pushNotification({
    Title: 'Clear Accounts',
    Message: 'Success clear all accounts.',
    Popup: true,
    Type: localStore.notify.NotifyType.Info
  })
}
</script>
