<template>
  <router-view v-slot='{ Component }'>
    <component :is='Component' v-if='Component' />
  </router-view>
</template>

<script setup lang='ts'>
import { onErrorCaptured } from 'vue'

onErrorCaptured((error) => {
  document.body?.setAttribute(
    'data-app-error',
    error instanceof Error ? error.stack || error.message : String(error)
  )
  return false
})
</script>
