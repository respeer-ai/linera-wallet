<template>
  <ChangeSetting />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const ChangeSetting = defineAsyncComponent(
  () => import('src/components/ChangeSetting.vue')
)
</script>
