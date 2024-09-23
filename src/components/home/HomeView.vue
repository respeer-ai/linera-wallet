<template>
  <div class='full-width'>
    <PageHeaderView />
    <MainView v-if='!showSettingMenu' />
    <div v-else class='full-width full-height'>
      <SettingView />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { computed } from 'vue'

import PageHeaderView from '../header/PageHeaderView.vue'
import MainView from '../main/MainView.vue'
import SettingView from '../setting/SettingView.vue'

const showSettingMenu = computed(() => localStore.oneShotSetting.showSettingMenu)

</script>
