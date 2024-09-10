<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { onMounted, ref, toRef, watch } from 'vue'
import { Network, type MicrochainOwner } from '../../model'
import { dbWallet } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'

interface Props {
  create?: MicrochainOwner
  update?: MicrochainOwner
  delete?: number
}

const props = defineProps<Props>()
const create = toRef(props, 'create')
const update = toRef(props, 'update')
const _delete = toRef(props, 'delete')

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

watch(create, () => {
  if (!create.value) return
  void dbWallet.microchainOwners.add(JSON.parse(JSON.stringify(create.value)) as MicrochainOwner)
})

watch(update, () => {
  if (!update.value) return
  void dbWallet.microchainOwners.update(update.value.id, JSON.parse(JSON.stringify(update.value)) as MicrochainOwner)
})

watch(_delete, () => {
  if (_delete.value === undefined) return
  void dbWallet.microchainOwners.delete(_delete.value)
})

onMounted(() => {
  if (!create.value) return
  void dbWallet.microchainOwners.add(JSON.parse(JSON.stringify(create.value)) as MicrochainOwner)
})

</script>
