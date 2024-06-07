<template>
  <div>
    <PupupHeader />
  </div>
</template>
<script setup lang='ts'>
import { useQuasar } from 'quasar'
import { onMounted, onUnmounted } from 'vue'
import { BexPayload } from '@quasar/app-vite'
import { popup } from 'src/localstores'
import { commontypes } from 'src/types'

import PupupHeader from 'src/components/extension/PupupHeader.vue'

const quasar = useQuasar()
const _popup = popup.usePopupStore()

const handleNewRequest = (payload: BexPayload<commontypes.PopupRequest, unknown>) => {
  _popup.insertRequest(payload)
}

onMounted(() => {
  _popup.$reset()
  quasar.bex.on('popup.new', handleNewRequest)
})

onUnmounted(() => {
  quasar.bex.off('popup.new', handleNewRequest)
})
</script>
