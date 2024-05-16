<template>
  <Accounts />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const Accounts = defineAsyncComponent(
  () => import('src/components/Accounts.vue')
)
</script>
