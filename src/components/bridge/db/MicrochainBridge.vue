<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
  <MicrochainOwnerBridge ref='microchainOwnerBridge' v-model:microchain-owners='microchainOwners' />
</template>

<script setup lang='ts'>
import { ref, toRef, watch } from 'vue'
import { db } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'
import MicrochainOwnerBridge from './MicrochainOwnerBridge.vue'

interface Props {
  owner?: string
}

const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const selectedNetwork = ref(undefined as unknown as db.Network)

const microchains = defineModel<db.Microchain[]>('microchains')
const selectedMicrochain = defineModel<db.Microchain>('selectedMicrochain')

const microchainOwners = ref([] as db.MicrochainOwner[])

const microchainOwnerBridge = ref<InstanceType<typeof MicrochainOwnerBridge>>()

const _microchains = useObservable<db.Microchain[]>(
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

const ownerMicrochains = (owner: string): db.Microchain[] => {
  return microchains.value?.filter((microchain) => {
    return microchainOwners.value.findIndex((el) => el.owner === owner && el.microchain === microchain.microchain) >= 0
  }) || []
}

const addMicrochain = async (owner: string, microchainId: string, messageId: string, certificateHash: string, name?: string, _default?: boolean) => {
  await dbWallet.microchains.add({
    microchain: microchainId,
    balance: 0,
    messageId,
    certificateHash,
    networkId: selectedNetwork.value.id,
    name,
    default: _default,
    selected: true
  } as db.Microchain)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await microchainOwnerBridge.value?.addMicrochainOwner(owner, microchainId)
}

defineExpose({
  ownerMicrochains,
  addMicrochain
})

</script>
