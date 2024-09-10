<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { onMounted, ref, toRef, watch } from 'vue'
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
const created = defineModel<boolean>('created')
const updated = defineModel<boolean>('updated')
const deleted = defineModel<boolean>('deleted')

const _owners = useObservable<Owner[]>(
  from(
    liveQuery(async () => {
      return await dbWallet.owners.toArray()
    })
  )
)

watch(_owners, () => {
  owners.value = _owners.value
  selectedOwner.value = _owners.value?.find((el) => el.selected)
})

watch(create, async () => {
  if (!create.value) return
  if (create.value.name === DEFAULT_ACCOUNT_NAME) create.value.name += ' ' + (await dbWallet.owners.count() + 1).toString()
  await dbWallet.owners.add(JSON.parse(JSON.stringify(create.value)) as Owner)
  created.value = true
})

watch(update, async () => {
  if (!update.value) return
  await dbWallet.owners.update(update.value.address, JSON.parse(JSON.stringify(update.value)) as Owner)
  updated.value = true
})

watch(_delete, async () => {
  if (_delete.value === undefined) return
  await dbWallet.owners.delete(_delete.value)
  deleted.value = true
})

onMounted(async () => {
  if (!create.value) return
  if (create.value.name === DEFAULT_ACCOUNT_NAME) create.value.name += dbWallet.owners.count().toString()
  await dbWallet.owners.add(JSON.parse(JSON.stringify(create.value)) as Owner)
  created.value = true
})

</script>
