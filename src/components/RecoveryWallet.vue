<template>
  <LoginPassword v-if='!initializeWallet' v-model:password='password' @unlocked='unlocked' />
  <InitializeAccount v-else :password='password' />
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { wallet } from 'src/localstores'

import LoginPassword from 'src/components/LoginPassword.vue'
import InitializeAccount from 'src/components/InitializeAccount.vue'

const initializeWallet = ref(false)
const password = ref('')

const router = useRouter()
const _wallet = wallet.useWalletStore()

const unlocked = () => {
  if (_wallet.accounts.size) {
    void router.push({ path: '/microchains' })
  } else {
    initializeWallet.value = true
  }
}

</script>
