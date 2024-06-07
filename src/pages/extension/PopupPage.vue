<template>
  <div>
    <PupupHeader />
    {{ params }}
  </div>
</template>
<script setup lang='ts'>
import { useQuasar } from 'quasar'
import { computed, onMounted } from 'vue'
import { BexPayload } from '@quasar/app-vite'
import { useRoute } from 'vue-router'

import PupupHeader from 'src/components/extension/PupupHeader.vue'

interface Query {
  requestId: string | number
  params?: string
}

const quasar = useQuasar()
const route = useRoute()
const params = computed(() => (route.query as unknown as Query).params)
const requestId = computed(() => (route.query as unknown as Query).requestId)

interface PopupNewRequest {
  requestId: number
}

interface PopupNewResponse {
  requestId: number
}

onMounted(() => {
  quasar.bex.on('popup.new', (payload: BexPayload<PopupNewRequest, PopupNewResponse>) => {
    void payload.respond({ requestId: payload.data?.requestId })
    void quasar.bex.send('popup.done', { requestId: requestId.value })
  })
  setTimeout(() => {
    void quasar.bex.send('popup.done', { requestId: requestId.value })
  }, 100)
})
</script>
