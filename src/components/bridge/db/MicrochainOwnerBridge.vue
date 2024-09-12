<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'
import { db } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'

const selectedNetwork = ref(undefined as unknown as db.Network)

const microchainOwners = defineModel<db.MicrochainOwner[]>('microchainOwners')

const _microchainOwners = useObservable<db.MicrochainOwner[]>(
  from(
    liveQuery(async () => {
      return await dbWallet.microchainOwners.toArray() || []
    })
  )
)

watch(_microchainOwners, () => {
  microchainOwners.value = _microchainOwners.value
})

const addMicrochainOwner = async (owner: string, microchain: string) => {
  await dbWallet.microchainOwners.add({
    microchain,
    owner,
    balance: 0
  } as db.MicrochainOwner)
}

defineExpose({
  addMicrochainOwner
})

</script>
