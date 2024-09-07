<template>
  <div :style='{margin: extensionMode ? "0" : "0 0 160px 0", maxWidth: "600px"}' class='fill-parent flex justify-center items-center'>
    <ImportWallet />
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { computed } from 'vue'

import ImportWallet from 'src/components/ImportWallet.vue'

const extensionMode = computed(() => localStore.oneShotSetting.extensionMode)

</script>
