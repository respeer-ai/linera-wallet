<template>
  <div>
    <NetworkSettingView v-if='localStore.oneShotSetting.selectedSettingMenu' />
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'

import NetworkSettingView from './NetworkSettingView.vue'

</script>
