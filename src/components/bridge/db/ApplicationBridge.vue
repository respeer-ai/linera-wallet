<template>
  <MicrochainOwnerBridge ref='microchainOwnerBridge' :owner='owner' v-model:application-owners='microchainOwners' />
</template>

<script setup lang='ts'>
import { computed, ref, toRef, watch } from 'vue'
import { dbModel } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

import MicrochainOwnerBridge from './MicrochainOwnerBridge.vue'

interface Props {
  owner?: string
}

const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const applications = defineModel<dbModel.Application[]>('applications')

const microchainOwners = ref([] as dbModel.MicrochainOwner[])
const microchainOwnerBridge = ref<InstanceType<typeof MicrochainOwnerBridge>>()

const microchains = computed(() => microchainOwners.value.reduce((ids: string[], a): string[] => { ids.push(a.microchain); return ids }, []))

const _applications = useObservable<dbModel.Application[]>(
  liveQuery(async () => {
    return owner.value
      ? await dbWallet.applications.where('microchain').anyOf(microchains.value).toArray()
      : await dbWallet.applications.toArray()
  }) as never
)

watch(_applications, () => {
  applications.value = _applications.value
})

</script>
