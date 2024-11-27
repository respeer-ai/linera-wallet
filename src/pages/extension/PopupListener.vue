<script setup lang='ts'>
import { useQuasar } from 'quasar'
import { onMounted, onUnmounted } from 'vue'
import { BexPayload } from '@quasar/app-vite'
import { localStore } from 'src/localstores'
import * as middlewaretypes from '../../../src-bex/middleware/types'
import { commontypes } from 'src/types'

const quasar = useQuasar()

const handleNewRequest = (payload: BexPayload<commontypes.PopupRequest, unknown>) => {
  switch (payload.data.type) {
    case middlewaretypes.PopupRequestType.CONFIRMATION:
      localStore.popup.addConnection({
        origin: payload.data.request.origin,
        favicon: payload.data.request.favicon,
        name: payload.data.request.name
      })
      return localStore.popup.insertRequest(payload)
    default:
      return void payload.respond({})
  }
}

onMounted(() => {
  localStore.popup.$reset()
  quasar.bex?.on('popup.new', handleNewRequest)
})

onUnmounted(() => {
  quasar.bex?.off('popup.new', handleNewRequest)
})

</script>
