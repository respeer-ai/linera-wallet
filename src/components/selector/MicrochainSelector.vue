<template>
  <q-card class='selector-card'>
    <p class='text-center text-bold text-grey-9 selector-title'>
      Select a microchain
    </p>
    <MicrochainsInnerView :searchable='true' @selected='onMicrochainSelected' />
  </q-card>
</template>

<script setup lang='ts'>
import { db } from 'src/model'

import MicrochainsInnerView from '../microchain/MicrochainsInnerView.vue'

const microchain = defineModel<db.Microchain>()
const emit = defineEmits<{(ev: 'selected', value?: db.Microchain): void}>()

const onMicrochainSelected = (_microchain: db.Microchain) => {
  microchain.value = _microchain
  emit('selected', _microchain)
}

</script>

<style lang='sass' scoped>
</style>
