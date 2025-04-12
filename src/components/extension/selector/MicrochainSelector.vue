<template>
  <div class='text-center full-width page-y-padding full-height'>
    <MicrochainsInnerView :owner='owner' :searchable='false' v-model='microchain' :show-selected='true' />
  </div>
</template>

<script setup lang='ts'>
import { dbModel } from 'src/model'
import { toRef } from 'vue'

import MicrochainsInnerView from '../../microchain/MicrochainsInnerView.vue'

interface Props {
  owner?: string
}

const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const microchain = defineModel<dbModel.Microchain>()

</script>
