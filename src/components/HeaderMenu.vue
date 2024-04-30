<template>
  <div class='row'>
    <q-img
      src='~assets/CheCko.png'
      height='24px'
      width='160px'
      fit='contain'
      :style='{margin: "12px 6px"}'
    />
    <q-space />
    <q-btn
      outline
      rounded
      label='Clear Accounts'
      @click='onClearAccountsClick'
      class='text-brown-10'
      :style='{margin: "6px"}'
    />
    <div :style='{margin: "6px"}'>
      <CreateAccount />
    </div>
    <AccountList />
  </div>
</template>

<script setup lang='ts'>
import { wallet } from 'src/localstores'

import AccountList from 'src/components/AccountList.vue'
import CreateAccount from 'src/components/CreateAccount.vue'

const _wallet = wallet.useWalletStore()

const onClearAccountsClick = () => {
  _wallet.reset()
}

</script>
