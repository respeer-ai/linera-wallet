<template>
  <div class='full-height overflow-scroll'>
    <div class='selector-search' v-if='searchable'>
      <q-input
        dense
        outlined
        rounded
        v-model='searchText'
      >
        <template #prepend>
          <q-icon name='bi-search' size='16px' />
        </template>
      </q-input>
    </div>
    <div v-for='_microchain in displayMicrochains' :key='_microchain.microchain'>
      <div
        :class='[ showSelected && microchain?.microchain === _microchain.microchain ? "selector-item-selected" : "" ]'
        @click='onMicrochainSelected(_microchain)'
      >
        <MicrochainCardView
          :microchain='_microchain' :show-indicator='showIndicator' :x-padding='xPadding' :show-selected='showSelected'
          :selected='microchain?.microchain === _microchain.microchain'
        />
      </div>
    </div>
  </div>
  <MicrochainBridge v-model:microchains='microchains' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, ref, toRef } from 'vue'

import MicrochainCardView from '../microchain/MicrochainCardView.vue'
import MicrochainBridge from '../bridge/db/MicrochainBridge.vue'

interface Props {
  searchable: boolean
  showIndicator?: boolean
  xPadding?: string
  showSelected?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  searchable: true,
  showIndicator: true,
  xPadding: '0',
  showSelected: false
})
const searchable = toRef(props, 'searchable')
const showIndicator = toRef(props, 'showIndicator')
const xPadding = toRef(props, 'xPadding')
const showSelected = toRef(props, 'showSelected')

const microchains = ref([] as db.Microchain[])
const searchText = ref('')
const displayMicrochains = computed(() => microchains.value.filter((el) => !searchText.value.length || el.name.includes(searchText.value) || el.microchain.includes(searchText.value)))

const microchain = defineModel<db.Microchain>()
const emit = defineEmits<{(ev: 'selected', value: db.Microchain): void}>()

const onMicrochainSelected = (_microchain: db.Microchain) => {
  microchain.value = _microchain
  emit('selected', _microchain)
}

</script>

<style lang='sass' scoped>
::v-deep .q-stepper__step-inner
  padding: 0 !important
</style>
