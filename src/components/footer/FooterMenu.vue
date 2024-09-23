<template>
  <div class='footer-inner-padding row'>
    <div v-if='!localStore.oneShotSetting.extensionMode' class='row'>
      Another browser wallet for Linera blockchain by
      <a href='https://respeer.ai' class='footer-text-margin-x-left'>respeer.ai</a>
      <strong class='footer-text-margin-x-left'>MaaS</strong>
    </div>
    <q-space />
    <TestnetTip />
    <a href='https://testnet.respeer.ai/policy' class='footer-menu-margin-x-left'>Policy</a>
    <a href='https://testnet.respeer.ai/terms' class='footer-menu-margin-x-left'>Terms of use</a>
    <q-space v-if='localStore.oneShotSetting.extensionMode' />
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'

import TestnetTip from '../testnet/TestnetTip.vue'

</script>
