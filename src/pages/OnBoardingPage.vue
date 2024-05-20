<template>
  <div class='fill-parent'>
    <OnBoarding v-if='!extensionMode' />
    <ExtensionOnBoarding v-else />
  </div>
</template>

<script setup lang='ts'>
import { oneshotsetting } from 'src/localstores'
import { computed } from 'vue'

import OnBoarding from 'src/components/OnBoarding.vue'
import ExtensionOnBoarding from 'src/components/extension/OnBoarding.vue'

const setting = oneshotsetting.useSettingStore()
const extensionMode = computed(() => setting.extensionMode)
</script>
