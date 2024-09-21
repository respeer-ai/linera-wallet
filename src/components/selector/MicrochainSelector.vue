<template>
  <q-card class='selector-card'>
    <p class='text-center text-bold text-grey-9 selector-title'>
      Select a microchain
    </p>
    <div class='selector-search'>
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
      <div class='cursor-pointer' @click='onMicrochainSelected(_microchain)'>
        <MicrochainCardView :microchain='_microchain' />
      </div>
    </div>
  </q-card>
  <MicrochainBridge v-model:microchains='microchains' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, ref } from 'vue'

import MicrochainCardView from '../microchain/MicrochainCardView.vue'
import MicrochainBridge from '../bridge/db/MicrochainBridge.vue'

const microchains = ref([] as db.Microchain[])
const searchText = ref('')
const displayMicrochains = computed(() => microchains.value.filter((el) => !searchText.value.length || el.name.includes(searchText.value) || el.microchain.includes(searchText.value)))

const microchain = defineModel<db.Microchain>()
const emit = defineEmits<{(ev: 'selected', value?: db.Microchain): void}>()

const onMicrochainSelected = (_microchain: db.Microchain) => {
  microchain.value = _microchain
  emit('selected', _microchain)
}

</script>

<style lang='sass' scoped>
::v-deep .q-stepper__step-inner
  padding: 0 !important
</style>
