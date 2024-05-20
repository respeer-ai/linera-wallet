<template>
  <div :style='{margin: extensionMode ? "0" : "0 0 160px 0"}' class='flex justify-center items-center'>
    <ImportWallet />
  </div>
</template>

<script setup lang='ts'>
import { oneshotsetting } from 'src/localstores'
import { computed } from 'vue'

import ImportWallet from 'src/components/ImportWallet.vue'

const setting = oneshotsetting.useSettingStore()
const extensionMode = computed(() => setting.extensionMode)

</script>
