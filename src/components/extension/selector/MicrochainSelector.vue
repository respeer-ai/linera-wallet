<template>
  <div class='text-center full-width page-y-padding full-height'>
    <MicrochainsInnerView :searchable='false' v-model='microchain' :show-selected='true' />
  </div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'

import MicrochainsInnerView from '../../microchain/MicrochainsInnerView.vue'

const microchain = defineModel<db.Microchain>()

</script>
