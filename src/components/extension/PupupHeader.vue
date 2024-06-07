<template>
  <div>{{ requestIds }}</div>
</template>

<script setup lang='ts'>
import { popup } from 'src/localstores'
import { computed } from 'vue'

const _popup = popup.usePopupStore()
const requestIds = computed(() => _popup.requestIds)

</script>
