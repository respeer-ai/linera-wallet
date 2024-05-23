<template>
  <div class='fill-parent'>
    <CreateTransfer v-if='!extensionMode' />
    <ExtensionCreateTransfer v-else />
  </div>
</template>

<script setup lang="ts">
import { oneshotsetting } from 'src/localstores'
import { computed } from 'vue'

import CreateTransfer from 'src/components/CreateTransfer.vue'
import ExtensionCreateTransfer from 'src/components/extension/CreateTransfer.vue'

const setting = oneshotsetting.useSettingStore()
const extensionMode = computed(() => setting.extensionMode)

</script>
