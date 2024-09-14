<template>
  <MicrochainOwnerBridge ref='microchainOwnerBridge' :owner='owner' v-model:application-owners='microchainOwners' />
</template>

<script setup lang='ts'>
import { computed, ref, toRef, watch } from 'vue'
import { db } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import MicrochainOwnerBridge from './MicrochainOwnerBridge.vue'

interface Props {
  owner?: string
}

const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const applications = defineModel<db.Application[]>('applications')

const microchainOwners = ref([] as db.MicrochainOwner[])
const microchainOwnerBridge = ref<InstanceType<typeof MicrochainOwnerBridge>>()

const microchains = computed(() => microchainOwners.value.reduce((ids: string[], a): string[] => { ids.push(a.microchain); return ids }, []))

const _applications = useObservable<db.Application[]>(
  from(
    liveQuery(async () => {
      return owner.value
        ? await dbWallet.applications.where('microchain').anyOf(microchains.value).toArray()
        : await dbWallet.applications.toArray()
    })
  )
)

watch(_applications, () => {
  applications.value = _applications.value
})

const ownerApplications = (owner: string): db.Application[] => {
  return applications.value?.filter((application) => {
    return microchainOwners.value.findIndex((el) => el.owner === owner && el.microchain === application.creationMicrochain) >= 0
  }) || []
}

const addApplication = async (applicationId: string, microchain: string, height: number, index: number): Promise<db.Application> => {
  const exist = applications.value?.find((el) => el.applicationId === applicationId)
  if (exist) return exist
  const application = {
    applicationId,
    creationMicrochain: microchain,
    creationHeight: height,
    applicationIndex: index
  } as db.Application
  await dbWallet.applications.add(application)
  return application
}

defineExpose({
  ownerApplications,
  addApplication
})

</script>
