<template>
  <OnBoarding v-if='!extensionMode' />
  <ExtensionOnBoarding v-else />
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { computed } from 'vue'

import OnBoarding from 'src/components/onboarding/OnBoarding.vue'
import ExtensionOnBoarding from 'src/components/extension/OnBoarding.vue'

const extensionMode = computed(() => localStore.oneShotSetting.extensionMode)
</script>
