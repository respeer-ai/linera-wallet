<template>
  <div>
    <PupupHeader />
    {{ params }}
  </div>
</template>
<script setup lang='ts'>
import { useQuasar } from 'quasar'
import { computed, onMounted, onUnmounted } from 'vue'
import { BexPayload } from '@quasar/app-vite'
import { useRoute } from 'vue-router'
import { popup } from 'src/localstores'
import { commontypes } from 'src/types'

import PupupHeader from 'src/components/extension/PupupHeader.vue'

interface Query {
  requestId: string | number
  params?: string
}

const quasar = useQuasar()
const route = useRoute()
const params = computed(() => (route.query as unknown as Query).params)

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
