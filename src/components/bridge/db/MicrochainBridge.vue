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
      return await ownerMicrochains(0, 1000, owner.value)
    }
    return (await dbWallet.microchains.toArray()).filter((el) => el.imported)
  }) as never
)

const updateMicrochains = (__microchains: db.Microchain[]) => {
  // TODO: there is some bug here to update defaultMicrochain
  microchains.value = [...__microchains || []]
  defaultMicrochain.value = microchains.value.find((el) => el.default)
  if (defaultMicrochain.value === undefined && microchains.value.length > 0) {
    defaultMicrochain.value = microchains.value[0]
  }
}

watch(_microchains, () => {
  updateMicrochains(_microchains.value ? _microchains.value : [])
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

watch(owner, async () => {
  if (owner.value === undefined) return
  const __microchains = await ownerMicrochains(0, 1000, owner.value)
  updateMicrochains(__microchains)
})

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
