<template>
  <div class='footer-inner-padding row'>
    <div v-if='!localStore.setting.extensionMode' class='row' v-html='$t("MSG_ANOTHER_BROWSER_WALLET_FOR_LINERA_BLOCKCHAIN_BY_RESPPER_MAAS")' />
    <q-space />
    <TestnetTip />
    <a href='https://testnet.respeer.ai/policy' class='footer-menu-margin-x-left'>{{ $t('MSG_POLICY') }}</a>
    <a href='https://testnet.respeer.ai/terms' class='footer-menu-margin-x-left'>{{ $t('MSG_TERM_OF_USE') }}</a>
    <q-space v-if='localStore.setting.extensionMode' />
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'

import TestnetTip from '../testnet/TestnetTip.vue'

</script>
