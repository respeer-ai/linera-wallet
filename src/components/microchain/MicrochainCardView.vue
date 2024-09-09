<template>
  <div>{{ microchain }}</div>
</template>

<script setup lang='ts'>
import { Microchain } from 'src/model'
import { toRef } from 'vue'

interface Props {
  microchain: Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

</script>
