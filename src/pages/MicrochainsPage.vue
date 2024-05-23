<template>
  <div class='fill-parent'>
    <Microchains v-if='!extensionMode' :style='{marginTop: "48px"}' />
    <ExtensionMicrochains v-else :show-title='false' :show-action='true' :style='{marginTop: "-12px"}' />
  </div>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import { oneshotsetting } from 'src/localstores'

import Microchains from 'src/components/Microchains.vue'
import ExtensionMicrochains from 'src/components/extension/Microchains.vue'

const setting = oneshotsetting.useSettingStore()
const extensionMode = computed(() => setting.extensionMode)

</script>
