<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { ref, toRef, watch } from 'vue'
import { dbModel } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import { dbBridge } from 'src/bridge'

import NetworkBridge from './NetworkBridge.vue'

interface Props {
  owner?: string
}
const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const selectedNetwork = ref(undefined as unknown as dbModel.Network)

const microchains = defineModel<dbModel.Microchain[]>('microchains')
const defaultMicrochain = defineModel<dbModel.Microchain>('defaultMicrochain')
const count = defineModel<number>('count')

const _microchains = useObservable<dbModel.Microchain[]>(
  liveQuery(async () => {
    if (owner.value !== undefined) {
      return await dbBridge.Microchain.microchains(0, 1000, undefined, undefined, owner.value)
    }
    return await dbWallet.microchains.toArray()
  }) as never
)

const _count = useObservable<number>(
  liveQuery(async () => {
    if (owner.value !== undefined) {
      return (await dbBridge.Microchain.microchains(0, 1000, undefined, undefined, owner.value)).length
    }
    return await dbBridge.Microchain.count()
  }) as never
)

const updateMicrochains = (__microchains: dbModel.Microchain[]) => {
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

watch(_count, () => {
  count.value = _count.value
})

watch(owner, async () => {
  if (owner.value === undefined) return
  const __microchains = await dbBridge.Microchain.microchains(0, 1000, undefined, undefined, owner.value)
  updateMicrochains(__microchains)
})

</script>
