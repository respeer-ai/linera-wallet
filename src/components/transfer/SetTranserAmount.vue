<template>
  <q-card flat class='full-width page-x-padding vertical-menus-margin transfer-card'>
    <div v-if='step === 1'>
      <SelectTransferAccount />
    </div>
  </q-card>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

import SelectTransferAccount from './SelectTransferAccount.vue'

const step = ref(1)

</script>
