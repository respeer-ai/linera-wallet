<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { DEFAULT_ACCOUNT_NAME, Network, type Owner } from '../../model'
import { dbWallet } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'

interface Props {
  create?: Owner
  update?: Owner
  delete?: string
}

const props = defineProps<Props>()
const create = toRef(props, 'create')
const update = toRef(props, 'update')
const _delete = toRef(props, 'delete')

const selectedNetwork = ref(undefined as unknown as Network)

const owners = defineModel<Owner[]>('owners')
const selectedOwner = defineModel<Owner>('selectedOwner')
const _dbWallet = computed(() => dbWallet(selectedNetwork.value?.id as number))

const _owners = useObservable<Owner[]>(
  from(
    liveQuery(async () => {
      return await _dbWallet.value?.owners.toArray()
    })
  )
)

watch(_owners, () => {
  owners.value = _owners.value
  selectedOwner.value = _owners.value?.find((el) => el.selected)
})

watch(create, () => {
  if (!create.value) return
  if (create.value.name === DEFAULT_ACCOUNT_NAME) create.value.name += _dbWallet.value.owners.count.toString()
  void _dbWallet.value.owners.add(JSON.parse(JSON.stringify(create.value)) as Owner)
})

watch(update, () => {
  if (!update.value) return
  void _dbWallet.value.owners.update(update.value.address, JSON.parse(JSON.stringify(update.value)) as Owner)
})

watch(_delete, () => {
  if (_delete.value === undefined) return
  void _dbWallet.value.owners.delete(_delete.value)
})

onMounted(() => {
  if (!create.value) return
  if (create.value.name === DEFAULT_ACCOUNT_NAME) create.value.name += _dbWallet.value.owners.count.toString()
  void _dbWallet.value.owners.add(JSON.parse(JSON.stringify(create.value)) as Owner)
})

</script>
