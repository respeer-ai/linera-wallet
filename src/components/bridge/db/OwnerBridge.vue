<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
  <PasswordBridge v-model:password='password' />
  <MicrochainBridge ref='microchainBridge' v-model:microchains='microchains' />
  <MicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'
import { dbModel } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import { dbBridge } from 'src/bridge'

import NetworkBridge from './NetworkBridge.vue'
import PasswordBridge from './PasswordBridge.vue'
import MicrochainBridge from './MicrochainBridge.vue'
import MicrochainOwnerBridge from './MicrochainOwnerBridge.vue'

const selectedNetwork = ref(undefined as unknown as dbModel.Network)
const password = ref(undefined as unknown as string)
const microchains = ref([] as dbModel.Microchain[])
const microchainOwners = ref([] as dbModel.MicrochainOwner[])

const owners = defineModel<dbModel.Owner[]>('owners')
const selectedOwner = defineModel<dbModel.Owner>('selectedOwner')
const nativeTokenBalance = defineModel<number>('nativeTokenBalance')
const nativeUsdBalance = defineModel<number>('nativeUsdBalance')

const microchainBridge = ref<InstanceType<typeof MicrochainBridge>>()

const _owners = useObservable<dbModel.Owner[]>(
  liveQuery(async () => {
    return [...await dbWallet.owners.toArray()]
  }) as never
)

const _nativeTokenBalance = useObservable<number>(
  liveQuery(async () => {
    const selectedOwner = await dbBridge.Owner.selected()
    if (!selectedOwner) return 0
    const nativeTokenId = (await dbBridge.Token.native())?.id || 0
    const balance = await dbBridge.Owner.ownerBalance(selectedOwner, nativeTokenId)
    return balance.tokenBalance
  }) as never
)

const _nativeUsdBalance = useObservable<number>(
  liveQuery(async () => {
    const selectedOwner = await dbBridge.Owner.selected()
    if (!selectedOwner) return 0
    const nativeTokenId = (await dbBridge.Token.native())?.id || 0
    const balance = await dbBridge.Owner.ownerBalance(selectedOwner, nativeTokenId)
    return balance.usdBalance
  }) as never
)

watch(_owners, async () => {
  owners.value = _owners.value
  selectedOwner.value = await dbBridge.Owner.selected()
})

watch(_nativeTokenBalance, () => {
  nativeTokenBalance.value = _nativeTokenBalance.value
})

watch(_nativeUsdBalance, () => {
  nativeUsdBalance.value = _nativeUsdBalance.value
})

</script>
