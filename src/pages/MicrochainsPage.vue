<template>
  <div class='fill-parent'>
    <Microchains v-if='!extensionMode' :style='{marginTop: "48px"}' />
    <ExtensionMicrochains v-else :show-title='false' :show-action='true' />
  </div>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import { localStore } from 'src/localstores'

import Microchains from 'src/components/Microchains.vue'
import ExtensionMicrochains from 'src/components/extension/Microchains.vue'

const extensionMode = computed(() => localStore.oneShotSetting.extensionMode)

</script>
