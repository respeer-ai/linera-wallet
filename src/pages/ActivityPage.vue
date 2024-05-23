<template>
  <div>
    <Activity v-if='!extensionMode' />
    <ExtensionActivity v-else />
  </div>
</template>

<script setup lang="ts">
import { oneshotsetting } from 'src/localstores'
import { computed } from 'vue'

import Activity from 'src/components/Activity.vue'
import ExtensionActivity from 'src/components/extension/Activity.vue'

const setting = oneshotsetting.useSettingStore()
const extensionMode = computed(() => setting.extensionMode)

</script>
