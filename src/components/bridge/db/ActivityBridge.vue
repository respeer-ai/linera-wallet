<template>
  <MicrochainOwnerBridge ref='microchainOwnerBridge' />
</template>
<script setup lang='ts'>
import { ref, toRef, watch } from 'vue'
import { db } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

import MicrochainOwnerBridge from './MicrochainOwnerBridge.vue'

interface Props {
  publicKey?: string
  microchain?: string
}

const props = defineProps<Props>()
const publicKey = toRef(props, 'publicKey')
const microchain = toRef(props, 'microchain')

const activities = defineModel<db.Activity[]>('activities')

const microchainOwnerBridge = ref<InstanceType<typeof MicrochainOwnerBridge>>()

const _activities = useObservable<db.Activity[]>(
  liveQuery(async () => {
    const acts = [] as db.Activity[]
    if (publicKey.value) {
      acts.push(...await dbWallet.activities.where('targetAddress').equalsIgnoreCase(publicKey.value).toArray())
      acts.push(...await dbWallet.activities.where('sourceAddress').equalsIgnoreCase(publicKey.value).toArray())
    } else if (microchain.value) {
      acts.push(...await dbWallet.activities.where('targetChain').equalsIgnoreCase(microchain.value).toArray())
      acts.push(...await dbWallet.activities.where('sourceChain').equalsIgnoreCase(microchain.value).toArray())
    } else {
      acts.push(...await dbWallet.activities.toArray())
    }
    return acts
  }) as never
)

watch(_activities, () => {
  activities.value = _activities.value
})

const addressActivities = async (publicKey: string): Promise<db.Activity[]> => {
  const acts = [] as db.Activity[]
  acts.push(...await dbWallet.activities.where('targetAddress').equalsIgnoreCase(publicKey).toArray())
  acts.push(...await dbWallet.activities.where('sourceAddress').equalsIgnoreCase(publicKey).toArray())
  return acts
}

const ownerActivities = async (owner: db.Owner): Promise<db.Activity[]> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const microchainOwners = await microchainOwnerBridge.value?.ownerMicrochainOwners(owner.owner) || [] as db.MicrochainOwner[]
  if (!microchainOwners) return []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const microchains = microchainOwners.reduce((ids: string[], a: db.MicrochainOwner): string[] => { ids.push(a.microchain); return ids }, []) || [] as string[]
  if (!microchains) return []
  const acts = [] as db.Activity[]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  acts.push(...await dbWallet.activities.where('targetChain').anyOf(microchains).toArray())
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  acts.push(...await dbWallet.activities.where('sourceChain').anyOf(microchains).toArray())
  return acts
}

const createActivity = async (
  sourceChain: string,
  sourceAddress: string | undefined,
  targetChain: string,
  targetAddress: string | undefined,
  amount: string,
  blockHeight: number,
  timestamp: number,
  certificateHash: string,
  grant: string
): Promise<db.Activity> => {
  const exist = activities.value?.find((el) => {
    return el.sourceChain === sourceChain &&
    el.sourceAddress === sourceAddress &&
    el.targetChain === targetChain &&
    el.targetAddress === targetAddress &&
    el.timestamp === timestamp &&
    el.blockHeight === blockHeight &&
    el.certificateHash === certificateHash
  })
  if (exist) return exist
  const activity = {
    sourceChain,
    sourceAddress,
    targetChain,
    targetAddress,
    amount,
    blockHeight,
    timestamp,
    certificateHash,
    grant
  } as db.Activity
  await dbWallet.activities.add(activity)
  return activity
}

defineExpose({
  addressActivities,
  ownerActivities,
  createActivity
})

</script>
