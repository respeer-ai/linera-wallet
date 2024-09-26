<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
  <MicrochainOwnerBridge ref='microchainOwnerBridge' />
</template>

<script setup lang='ts'>
import { ref, toRef, watch } from 'vue'
import { db } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'
import MicrochainOwnerBridge from './MicrochainOwnerBridge.vue'

interface Props {
  owner?: string
}
const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const selectedNetwork = ref(undefined as unknown as db.Network)

const microchains = defineModel<db.Microchain[]>('microchains')
const defaultMicrochain = defineModel<db.Microchain>('defaultMicrochain')

const microchainOwners = ref([] as db.MicrochainOwner[])

const microchainOwnerBridge = ref<InstanceType<typeof MicrochainOwnerBridge>>()

const _microchains = useObservable<db.Microchain[]>(
  liveQuery(async () => {
    if (owner.value !== undefined) {
      const microchainOwners = await dbWallet.microchainOwners.where('owner').equals(owner.value).toArray()
      const microchainIds = microchainOwners.reduce((ids: string[], a): string[] => { ids.push(a.microchain); return ids }, [])
      return await dbWallet.microchains.where('microchain').anyOf(microchainIds).toArray()
    }
    return await dbWallet.microchains.toArray()
  }) as never
)

watch(_microchains, () => {
  microchains.value = [..._microchains.value || []]
  if (defaultMicrochain.value) return
  if (owner.value !== undefined) {
    defaultMicrochain.value = _microchains.value?.find((el) => el.default)
  }
  if (defaultMicrochain.value === undefined && _microchains.value?.length) {
    defaultMicrochain.value = _microchains.value[0]
  }
})

const getMicrochains = async (offset: number, limit: number): Promise<db.Microchain[]> => {
  return await dbWallet.microchains.offset(offset).limit(limit).toArray()
}

const getMicrochain = async (microchain: string): Promise<db.Microchain | undefined> => {
  return await dbWallet.microchains.where('microchain').equals(microchain).first()
}

const microchainsCount = async (): Promise<number> => {
  return await dbWallet.microchains.count()
}

const ownerMicrochains = (owner: string): db.Microchain[] => {
  return microchains.value?.filter((microchain) => {
    return microchainOwners.value.findIndex((el) => el.owner === owner && el.microchain === microchain.microchain) >= 0
  }) || []
}

const createMicrochain = async (owner: string, microchainId: string, messageId?: string, certificateHash?: string, name?: string, _default?: boolean): Promise<db.Microchain> => {
  const exist = microchains.value?.find((el) => el.microchain === microchainId)
  if (exist) return exist
  const microchain = {
    microchain: microchainId,
    balance: 0,
    messageId,
    certificateHash,
    networkId: selectedNetwork.value.id,
    name,
    default: _default,
    selected: true
  } as db.Microchain
  await dbWallet.microchains.add(microchain)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await microchainOwnerBridge.value?.createMicrochainOwner(owner, microchainId)
  return microchain
}

const updateMicrochain = async (microchain: db.Microchain) => {
  await dbWallet.microchains.update(microchain.id, microchain)
}

defineExpose({
  ownerMicrochains,
  createMicrochain,
  updateMicrochain,
  getMicrochains,
  microchainsCount,
  getMicrochain
})

</script>
