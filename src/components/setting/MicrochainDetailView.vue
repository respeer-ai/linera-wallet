<template>
  <div>
    <div :class='[ "row vertical-sections-margin", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <q-avatar>
        <q-img :src='db.microchainAvatar(microchain)' />
      </q-avatar>
      <div class='selector-margin-x-left account-avatar'>
        <span class='text-bold text-grey-9'>{{ microchain.name || 'Microchain' }}</span>
        <div class='text-grey-8 selector-item-currency-sub'>
          $ {{ (chainUsdBalance + accountUsdBalance).toFixed(4) }} USD
        </div>
      </div>
      <q-space />
      <q-icon name='bi-check-circle-fill' size='16px' color='green-4' v-if='microchain.default' />
    </div>
    <MicrochainDetailInnerView :microchain='microchain' />
  </div>
  <MicrochainBalanceBridge :token-id='nativeTokenId' v-model:token-balance='chainTokenBalance' v-model:usd-balance='chainUsdBalance' />
  <MicrochainOwnerBalanceBridge
    :token-id='nativeTokenId' v-model:token-balance='accountTokenBalance' v-model:usd-balance='accountUsdBalance' :owner='selectedOwner?.owner'
    :microchain-id='microchain.microchain'
  />
  <TokenBridge ref='dbTokenBridge' />
  <OwnerBridge v-model:selected-owner='selectedOwner' />
  <ActivityBridge v-model:activities='activities' :microchain='microchain.microchain' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { localStore } from 'src/localstores'

import MicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import MicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import TokenBridge from '../bridge/db/TokenBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import ActivityBridge from '../bridge/db/ActivityBridge.vue'
import MicrochainDetailInnerView from '../microchain/MicrochainDetailInnerView.vue'

interface Props {
  microchain: db.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

const chainTokenBalance = ref(0)
const chainUsdBalance = ref(0)
const accountTokenBalance = ref(0)
const accountUsdBalance = ref(0)
const activities = ref([] as db.Activity[])

const selectedOwner = ref(undefined as unknown as db.Owner)

const dbTokenBridge = ref<InstanceType<typeof TokenBridge>>()

const nativeTokenId = ref(undefined as unknown as number)

onMounted(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  nativeTokenId.value = (await dbTokenBridge.value?.nativeToken())?.id as number
})

</script>
