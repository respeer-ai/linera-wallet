<template>
  <div :style='{margin: extensionMode ? "0" : "0 0 160px 0", maxWidth: "600px", width: "100%"}'>
    <RecoveryWallet />
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { computed } from 'vue'

import RecoveryWallet from 'src/components/RecoveryWallet.vue'

const extensionMode = computed(() => localStore.oneShotSetting.extensionMode)
</script>
