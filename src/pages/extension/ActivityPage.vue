<template>
  <Activity />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const Activity = defineAsyncComponent(
  () => import('src/components/Activity.vue')
)
</script>
