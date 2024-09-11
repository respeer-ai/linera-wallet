<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'
import { Network, type Microchain } from '../../model'
import { dbWallet } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'

const selectedNetwork = ref(undefined as unknown as Network)

const microchains = defineModel<Microchain[]>('microchains')
const selectedMicrochain = defineModel<Microchain>('selectedMicrochain')

const _microchains = useObservable<Microchain[]>(
  from(
    liveQuery(async () => {
      return await dbWallet.microchains.toArray() || []
    })
  )
)

watch(_microchains, () => {
  microchains.value = _microchains.value
  selectedMicrochain.value = _microchains.value?.find((el) => el.selected)
})

</script>
