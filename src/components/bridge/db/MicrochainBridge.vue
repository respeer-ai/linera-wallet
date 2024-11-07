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

const microchainOwnerBridge = ref<InstanceType<typeof MicrochainOwnerBridge>>()

const _microchains = useObservable<db.Microchain[]>(
  liveQuery(async () => {
    if (owner.value !== undefined) {
      const microchainOwners = await dbWallet.microchainOwners.where('owner').equals(owner.value).toArray()
      const microchainIds = microchainOwners.reduce((ids: string[], a): string[] => { ids.push(a.microchain); return ids }, [])
      return (await dbWallet.microchains.where('microchain').anyOf(microchainIds).toArray()).filter((el) => el.imported)
    }
    return (await dbWallet.microchains.toArray()).filter((el) => el.imported)
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

const getMicrochains = async (offset: number, limit: number, imported?: boolean): Promise<db.Microchain[]> => {
  return (await dbWallet.microchains.offset(offset).limit(limit).toArray()).filter((el) => !imported || el.imported)
}

const getMicrochain = async (microchain: string): Promise<db.Microchain | undefined> => {
  return await dbWallet.microchains.where('microchain').equals(microchain).first()
}

const microchainsCount = async (): Promise<number> => {
  return await dbWallet.microchains.count()
}

const ownerMicrochains = async (offset: number, limit: number, owner: string, imported?: boolean): Promise<db.Microchain[]> => {
  const microchainOwners = await dbWallet.microchainOwners.where('owner').equals(owner).toArray()
  return (await dbWallet.microchains.offset(offset).limit(limit).toArray()).filter((microchain) => {
    return microchainOwners.findIndex((el) => el.owner === owner && el.microchain === microchain.microchain) >= 0 && (!imported || microchain.imported)
  })
}

const microchainOwner = async (microchain: string): Promise<db.Owner | undefined> => {
  const microchainOwners = (await dbWallet.microchainOwners.toArray()).filter((el) => el.microchain === microchain)
  if (!microchainOwners.length) return undefined
  return (await dbWallet.owners.toArray()).find((el) => microchainOwners.findIndex((el1) => el1.owner === el.owner) >= 0)
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
    imported: true
  } as db.Microchain
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await microchainOwnerBridge.value?.createMicrochainOwner(owner, microchainId)
  await dbWallet.microchains.add(microchain)
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
  getMicrochain,
  microchainOwner
})

</script>
