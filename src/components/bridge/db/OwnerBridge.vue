<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
  <PasswordBridge v-model:password='password' />
  <MicrochainBridge ref='microchainBridge' v-model:microchains='microchains' />
  <MicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'
import { db } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'
import PasswordBridge from './PasswordBridge.vue'
import MicrochainBridge from './MicrochainBridge.vue'
import MicrochainOwnerBridge from './MicrochainOwnerBridge.vue'

const selectedNetwork = ref(undefined as unknown as db.Network)
const password = ref(undefined as unknown as string)
const microchains = ref([] as db.Microchain[])
const microchainOwners = ref([] as db.MicrochainOwner[])

const owners = defineModel<db.Owner[]>('owners')
const selectedOwner = defineModel<db.Owner>('selectedOwner')

const microchainBridge = ref<InstanceType<typeof MicrochainBridge>>()

const _owners = useObservable<db.Owner[]>(
  liveQuery(async () => {
    return [...await dbWallet.owners.toArray()]
  }) as never
)

watch(_owners, () => {
  owners.value = _owners.value
  selectedOwner.value = _owners.value?.find((el) => el.selected)
})

</script>
