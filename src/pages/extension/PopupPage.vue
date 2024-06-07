<template>
  <div>
    <PupupHeader />
  </div>
</template>
<script setup lang='ts'>
import { useQuasar } from 'quasar'
import { onMounted } from 'vue'
import { BexPayload } from '@quasar/app-vite'

import PupupHeader from 'src/components/extension/PupupHeader.vue'

const quasar = useQuasar()

interface PopupNewRequest {
  popupId: number
}

onMounted(() => {
  quasar.bex.on('popup.new', (payload: BexPayload<PopupNewRequest, number>) => {
    console.log(payload.data)
    void payload.respond(100000)
  })
})
</script>
