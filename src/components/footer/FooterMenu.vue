<template>
  <div class='footer-inner-padding row'>
    <div v-if='!localStore.setting.extensionMode' class='row' v-html='$t("MSG_ANOTHER_BROWSER_WALLET_FOR_LINERA_BLOCKCHAIN_BY_RESPPER_MAAS")' />
    <q-space />
    <TestnetTip />
    <div class='footer-menu-margin-x-left like-link cursor-pointer' @click='onPolicyClick'>
      {{ $t('MSG_POLICY') }}
    </div>
    <div class='footer-menu-margin-x-left like-link cursor-pointer' @click='onTermOfUseClick'>
      {{ $t('MSG_TERM_OF_USE') }}
    </div>
    <q-space v-if='localStore.setting.extensionMode' />
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'

import TestnetTip from '../testnet/TestnetTip.vue'

const onPolicyClick = () => {
  window.open('https://testnet.respeer.ai/policy')
}

const onTermOfUseClick = () => {
  window.open('https://testnet.respeer.ai/terms')
}

</script>
