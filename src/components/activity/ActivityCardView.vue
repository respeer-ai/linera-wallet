<template>
  <div>{{ activity }}</div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { toRef } from 'vue'

interface Props {
  activity: db.Activity
}
const props = defineProps<Props>()
const activity = toRef(props, 'activity')

</script>
