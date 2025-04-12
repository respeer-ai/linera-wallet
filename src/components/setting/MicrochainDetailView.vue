<template>
  <div>
    <div :class='[ "row vertical-sections-margin", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <q-avatar>
        <q-img :src='dbModel.microchainAvatar(microchain)' />
      </q-avatar>
      <div class='selector-margin-x-left account-avatar'>
        <span class='text-bold text-grey-9'>{{ microchain.name || 'Microchain' }}</span>
        <div class='text-grey-8 selector-item-currency-sub'>
          $ {{ (chainUsdBalance + accountUsdBalance).toFixed(4) }} {{ $t('MSG_USD') }}
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
  <OwnerBridge v-model:selected-owner='selectedOwner' />
  <ActivityBridge v-model:activities='activities' :microchain='microchain.microchain' />
</template>

<script setup lang='ts'>
import { dbModel } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { localStore } from 'src/localstores'
import { dbBridge } from 'src/bridge'

import MicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import MicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import ActivityBridge from '../bridge/db/ActivityBridge.vue'
import MicrochainDetailInnerView from '../microchain/MicrochainDetailInnerView.vue'

interface Props {
  microchain: dbModel.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

const chainTokenBalance = ref(0)
const chainUsdBalance = ref(0)
const accountTokenBalance = ref(0)
const accountUsdBalance = ref(0)
const activities = ref([] as dbModel.Activity[])

const selectedOwner = ref(undefined as unknown as dbModel.Owner)

const nativeTokenId = ref(undefined as unknown as number)

onMounted(async () => {
  nativeTokenId.value = (await dbBridge.Token.native())?.id as number
})

</script>
