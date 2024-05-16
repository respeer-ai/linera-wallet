<template>
  <CreateTransfer />
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const CreateTransfer = defineAsyncComponent(
  () => import('src/components/CreateTransfer.vue')
)
</script>
