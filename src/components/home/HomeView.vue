<template>
  <div class='full-width wide-page'>
    <PageHeaderView />
    <MainView v-if='!showSettingMenu' />
    <SettingView v-else />
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
