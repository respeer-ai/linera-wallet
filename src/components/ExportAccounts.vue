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
import { notify, wallet } from 'src/localstores'

const _wallet = wallet.useWalletStore()
const notification = notify.useNotificationStore()

const onExportAccountsClick = () => {
  console.log(_wallet.accounts)
  notification.pushNotification({
    Title: 'Clear Accounts',
    Message: 'Success clear all accounts.',
    Popup: true,
    Type: notify.NotifyType.Info
  })
}
</script>
