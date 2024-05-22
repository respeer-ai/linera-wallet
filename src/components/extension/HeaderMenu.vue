<template>
  <div class='row fill-parent' :style='{ padding: "16px 0 8px 0" }'>
    <q-icon
      :name='"img:" + lineraLogo'
      size='24px'
      :style='{ margin: "12px" }'
    />
    <q-space />
    <AccountList :show-logo='false' :show-digits='6' label='Linera DevNet' />
    <q-space />
    <div :style='{lineHeight: "48px"}'>
      <q-icon name='link' size='24px' color='blue-6' class='cursor-pointer' />
    </div>
    <div
      class='text-brown-10 text-bold'
      :style='{
        margin: "10px 4px",
        fontSize: "16px",
      }'
      v-if='currentAddress && false'
    >
      {{ accountBalance.toFixed(2) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { wallet } from 'src/localstores'

import AccountList from 'src/components/AccountList.vue'
import lineraLogo from 'src/assets/LineraLogo.png'

const _wallet = wallet.useWalletStore()
const currentAddress = computed(() => _wallet.currentAddress)

const accountBalance = computed(() =>
  _wallet.accountBalance(undefined, undefined)
)
</script>
<style scoped lang="sass">
.logo
  margin: 12px 6px
</style>
