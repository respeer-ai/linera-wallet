<template>
  <WalletSetting v-if='!extensionMode' :style='{maxWidth: "736px", margin: "48px 0"}' />
  <ExtensionWalletSetting v-else :style='{height: "478px"}' />
</template>

<script setup lang="ts">
import { oneshotsetting } from 'src/localstores'
import { computed } from 'vue'

import WalletSetting from 'src/components/WalletSetting.vue'
import ExtensionWalletSetting from 'src/components/extension/WalletSetting.vue'

const setting = oneshotsetting.useSettingStore()
const extensionMode = computed(() => setting.extensionMode)

</script>
