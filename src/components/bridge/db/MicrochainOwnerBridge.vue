<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { ref, toRef, watch } from 'vue'
import { db } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'

interface Props {
  microchain?: string
  owner?: string
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')
const owner = toRef(props, 'owner')

const selectedNetwork = ref(undefined as unknown as db.Network)

const microchainOwners = defineModel<db.MicrochainOwner[]>('microchainOwners')

const _microchainOwners = useObservable<db.MicrochainOwner[]>(
  from(
    liveQuery(async () => {
      return microchain.value?.length
        ? await dbWallet.microchainOwners.where('microchain').equals(microchain.value).toArray()
        : owner.value?.length
          ? await dbWallet.microchainOwners.where('owner').equals(owner.value).toArray()
          : await dbWallet.microchainOwners.toArray()
    })
  )
)

watch(_microchainOwners, () => {
  microchainOwners.value = _microchainOwners.value
})

const ownerMicrochainOwners = async (owner: string): Promise<db.MicrochainOwner[]> => {
  return await dbWallet.microchainOwners.where('owner').equals(owner).toArray()
}

const addMicrochainOwner = async (owner: string, microchain: string) => {
  await dbWallet.microchainOwners.add({
    microchain,
    owner,
    balance: 0
  } as db.MicrochainOwner)
}

defineExpose({
  ownerMicrochainOwners,
  addMicrochainOwner
})

</script>
