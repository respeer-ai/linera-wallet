<template>
  <div>{{ application }}</div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { toRef } from 'vue'

interface Props {
  application: db.Application
}
const props = defineProps<Props>()
const application = toRef(props, 'application')

</script>
