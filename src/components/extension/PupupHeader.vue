<template>
  <div>HHHHHHHHH {{ currentPopupId }}</div>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import { persistentsetting } from 'src/localstores'

const _persistentsetting = persistentsetting.useSettingStore()
const currentPopupId = computed(() => _persistentsetting.currentPopupId)
</script>
