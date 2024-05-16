<template>
  <Microchains />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const Microchains = defineAsyncComponent(
  () => import('src/components/Microchains.vue')
)
</script>
