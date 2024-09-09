<template>
  <div class='fill-parent'>
    <Activity v-if='!extensionMode' />
    <ExtensionActivity v-else />
  </div>
</template>

<script setup lang="ts">
import { localStore } from 'src/localstores'
import { computed } from 'vue'

import Activity from 'src/components/Activity.vue'
import ExtensionActivity from 'src/components/extension/Activity.vue'

const extensionMode = computed(() => localStore.oneShotSetting.extensionMode)

</script>
