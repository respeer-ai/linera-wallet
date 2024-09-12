<template>
  <div>{{ microchain }}</div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { toRef } from 'vue'

interface Props {
  microchain: db.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

</script>
