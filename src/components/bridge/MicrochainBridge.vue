<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
  <MicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
</template>

<script setup lang='ts'>
import { ref, toRef, watch } from 'vue'
import { MicrochainOwner, Network, type Microchain } from '../../model'
import { dbWallet } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'
import MicrochainOwnerBridge from './MicrochainOwnerBridge.vue'

interface Props {
  owner?: string
}

const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const selectedNetwork = ref(undefined as unknown as Network)

const microchains = defineModel<Microchain[]>('microchains')
const selectedMicrochain = defineModel<Microchain>('selectedMicrochain')

const microchainOwners = ref([] as MicrochainOwner[])

const _microchains = useObservable<Microchain[]>(
  from(
    liveQuery(async () => {
      return owner.value
        ? await dbWallet.microchains.where('owner').equals(owner.value).toArray()
        : await dbWallet.microchains.toArray()
    })
  )
)

watch(_microchains, () => {
  microchains.value = _microchains.value
  selectedMicrochain.value = _microchains.value?.find((el) => el.selected)
})

const ownerMicrochains = (owner: string): Microchain[] => {
  return microchains.value?.filter((microchain) => {
    return microchainOwners.value.findIndex((el) => el.owner === owner && el.microchain === microchain.microchain) >= 0
  }) || []
}

defineExpose({
  ownerMicrochains
})

</script>
