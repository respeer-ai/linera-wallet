<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { Network, type Microchain } from '../../model'
import { dbWallet } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'

interface Props {
  create?: Microchain
  update?: Microchain
  delete?: string
}

const props = defineProps<Props>()
const create = toRef(props, 'create')
const update = toRef(props, 'update')
const _delete = toRef(props, 'delete')

const selectedNetwork = ref(undefined as unknown as Network)

const microchains = defineModel<Microchain[]>('microchains')
const selectedMicrochain = defineModel<Microchain>('selectedMicrochain')
const _dbWallet = computed(() => dbWallet(selectedNetwork.value?.id as number))

const _microchains = useObservable<Microchain[]>(
  from(
    liveQuery(async () => {
      return await _dbWallet.value?.microchains.toArray()
    })
  )
)

watch(_microchains, () => {
  microchains.value = _microchains.value
  selectedMicrochain.value = _microchains.value?.find((el) => el.selected)
})

watch(create, () => {
  if (!create.value) return
  void _dbWallet.value.microchains.add(JSON.parse(JSON.stringify(create.value)) as Microchain)
})

watch(update, () => {
  if (!update.value) return
  void _dbWallet.value.microchains.update(update.value.microchain, JSON.parse(JSON.stringify(update.value)) as Microchain)
})

watch(_delete, () => {
  if (_delete.value === undefined) return
  void _dbWallet.value.microchains.delete(_delete.value)
})

onMounted(() => {
  if (!create.value) return
  void _dbWallet.value.microchains.add(JSON.parse(JSON.stringify(create.value)) as Microchain)
})

</script>
