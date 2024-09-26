<template>
  <q-card :style='{height: "160px", width: "100%"}' flat>
    <q-inner-loading
      :showing='processing'
      class='text-red-4'
    >
      <q-spinner-facebook size='80px' />
    </q-inner-loading>
  </q-card>
</template>

<script setup lang='ts'>
import { toRef } from 'vue'

interface Props {
  processing: boolean
}
const props = defineProps<Props>()
const processing = toRef(props, 'processing')

</script>
