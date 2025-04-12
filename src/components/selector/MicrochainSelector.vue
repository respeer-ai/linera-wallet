<template>
  <q-card class='selector-card'>
    <p class='text-center text-bold text-grey-9 selector-title'>
      {{ $t('MSG_SELECT_A_MICROCHAIN') }}
    </p>
    <MicrochainsInnerView :owner='owner' :searchable='true' @selected='onMicrochainSelected' />
  </q-card>
</template>

<script setup lang='ts'>
import { dbModel } from 'src/model'
import { toRef } from 'vue'

import MicrochainsInnerView from '../microchain/MicrochainsInnerView.vue'

interface Props {
  owner?: string
}

const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const microchain = defineModel<dbModel.Microchain>()
const emit = defineEmits<{(ev: 'selected', value?: dbModel.Microchain): void}>()

const onMicrochainSelected = (_microchain: dbModel.Microchain) => {
  microchain.value = _microchain
  emit('selected', _microchain)
}

</script>

<style lang='sass' scoped>
</style>
