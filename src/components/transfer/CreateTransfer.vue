<template>
  <q-card flat class='full-width page-x-padding vertical-menus-margin transfer-card'>
    <div v-if='step === 1'>
      <SelectTransferAccount @next='onSelectTransferAccountNext' @back='onSelectTransferAccountBack' />
    </div>
  </q-card>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import SelectTransferAccount from './SelectTransferAccount.vue'

const step = ref(1)

const router = useRouter()

const onSelectTransferAccountNext = () => {
  step.value++
}

const onSelectTransferAccountBack = () => {
  void router.back()
}

</script>
