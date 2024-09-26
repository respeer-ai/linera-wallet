<template>
  <div class='full-width text-left selector-y-padding'>
    <q-checkbox
      v-model='checked'
      class='cursor-pointer'
      checked-icon='task_alt'
      unchecked-icon='highlight_off'
    >
      <div class='text-left'>
        <div class='text-bold label-text-middle'>
          {{ text }}
        </div>
        <div v-if='caption'>
          {{ caption }}
        </div>
      </div>
    </q-checkbox>
  </div>
</template>

<script setup lang='ts'>
import { toRef } from 'vue'

const checked = defineModel<boolean>()

interface Props {
  text: string
  caption?: string
}
const props = defineProps<Props>()
const text = toRef(props, 'text')
const caption = toRef(props, 'caption')

</script>
