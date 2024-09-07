<template>
  <div class='full-width'>
    <LoginPassword v-if='step === 0' v-model:password='password' @unlocked='unlocked' />
    <div v-if='step === 1'>
      <InitializeAccount :password='password' />
      <div class='row'>
        <q-space />
        <q-btn
          flat
          class='text-brown-10 bg-red-2'
          :style='{borderRadius: "16px", width: "100%", maxWidth: "400px", margin: "48px 0 0 0"}'
          label='Validate Account'
          @click='step = 2'
        />
        <q-space />
      </div>
    </div>
    <div v-if='step === 2'>
      <ValidateAccount v-if='!extensionMode' :mnemonic='mnemonic' v-model='mnemonicValid' />
      <div class='row'>
        <q-space />
        <q-btn
          flat
          class='text-brown-10 bg-red-2'
          :style='{borderRadius: "16px", width: "100%", maxWidth: "400px", margin: "48px 0 0 0"}'
          label='Linera Now'
          @click='onLineraNowClick'
          :disable='!publicKey.length || accountError'
        />
        <q-space />
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { wallet, oneshotsetting } from 'src/localstores'

import LoginPassword from 'src/components/LoginPassword.vue'
import InitializeAccount from 'src/components/account/InitializeAccount.vue'
import ValidateAccount from 'src/components/account/ValidateAccount.vue'

const password = ref('')
const step = ref(0)
const publicKey = ref('')
const accountError = ref(true)
const mnemonic = ref('')
const mnemonicValid = ref(false)

const router = useRouter()
const _wallet = wallet.useWalletStore()
const setting = oneshotsetting.useSettingStore()
const extensionMode = computed(() => setting.extensionMode)

const unlocked = () => {
  if (_wallet.accounts.size) {
    void router.push({ path: extensionMode.value ? '/extension/accountinfo' : '/microchains' })
  } else {
    step.value = 1
  }
}

const onLineraNowClick = () => {
  void router.push({ path: extensionMode.value ? '/extension/accountinfo' : '/microchains' })
}

</script>
