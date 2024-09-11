<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'
import { Network, type MicrochainOwner } from '../../model'
import { dbWallet } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'

const selectedNetwork = ref(undefined as unknown as Network)

const microchainOwners = defineModel<MicrochainOwner[]>('microchainOwners')

const _microchainOwners = useObservable<MicrochainOwner[]>(
  from(
    liveQuery(async () => {
      return await dbWallet.microchainOwners.toArray() || []
    })
  )
)

watch(_microchainOwners, () => {
  microchainOwners.value = _microchainOwners.value
})

</script>
