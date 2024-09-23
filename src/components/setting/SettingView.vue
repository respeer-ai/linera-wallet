<template>
  <div class='full-width full-height'>
    <div v-if='localStore.oneShotSetting.extensionMode'>
      <SettingNarrowView />
    </div>
    <div v-else>
      <SettingWideView />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'

import SettingWideView from './SettingWideView.vue'
import SettingNarrowView from './SettingNarrowView.vue'

</script>
