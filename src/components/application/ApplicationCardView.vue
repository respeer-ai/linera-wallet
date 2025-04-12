<template>
  <div>{{ application }}</div>
</template>

<script setup lang='ts'>
import { dbModel } from 'src/model'
import { toRef } from 'vue'

interface Props {
  application: dbModel.Application
}
const props = defineProps<Props>()
const application = toRef(props, 'application')

</script>
