<template>
  <div :style='{margin: extensionMode ? "0" : "0 0 160px 0"}'>
    <InitializeWallet />
  </div>
</template>

<script setup lang='ts'>
import { oneshotsetting } from 'src/localstores'
import { computed } from 'vue'

import InitializeWallet from 'src/components/InitializeWallet.vue'

const setting = oneshotsetting.useSettingStore()
const extensionMode = computed(() => setting.extensionMode)
</script>
