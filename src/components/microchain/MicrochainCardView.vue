<template>
  <q-item class='row full-width tab-panel-item' clickable>
    <div :class='[ "selector-indicator", microchain.default ? "selector-indicator-selected" : "" ]' />
    <q-avatar class='selector-margin-x-left'>
      <q-img :src='db.microchainAvatar(microchain)' />
      <q-badge color='transparent' rounded transparent floating>
        <q-img :src='lineraLogo' width='14px' height='14px' />
      </q-badge>
    </q-avatar>
    <div class='selector-margin-x-left'>
      <div class='text-bold text-grey-9 row'>
        <div>
          0x{{ shortid.shortId(microchain.microchain, 5) }}
        </div>
        <div class='page-item-x-margin-left cursor-pointer'>
          <q-icon name='bi-copy' size='12px' />
        </div>
      </div>
      <div class='text-left'>
        {{ chainTokenBalance }} <span class='text-grey-6 selector-item-currency-sub'>TLINERA</span>
      </div>
    </div>
    <q-space />
    <div>
      <div class='text-bold text-grey-9 text-right'>
        {{ ownerTokenBalance }} <span class='selector-item-currency-sub'>TLINERA</span>
      </div>
      <div class='text-right'>
        $ {{ chainUsdBalance + ownerUsdBalance }} <span class='text-grey-6 selector-item-currency-sub'>USD</span>
      </div>
    </div>
    <div :class='[ "selector-indicator selector-margin-x-left" ]' />
  </q-item>
  <DbMicrochainBalanceBridge v-model:token-balance='chainTokenBalance' v-model:usd-balance='chainUsdBalance' :token-id='nativeTokenId' :microchain-id='microchain.microchain' />
  <DbOwnerBridge v-model:selected-owner='owner' />
  <DbMicrochainOwnerBalanceBridge
    v-model:token-balance='ownerTokenBalance' v-model:usd-balance='ownerUsdBalance' :token-id='nativeTokenId' :microchain-id='microchain.microchain'
    :owner='owner?.owner'
  />
  <DbTokenBridge ref='dbTokenBridge' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { shortid } from 'src/utils'

import DbMicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import DbMicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import DbTokenBridge from '../bridge/db/TokenBridge.vue'
import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'

import { lineraLogo } from 'src/assets'

interface Props {
  microchain: db.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

const dbTokenBridge = ref<InstanceType<typeof DbTokenBridge>>()

const chainTokenBalance = ref(0)
const chainUsdBalance = ref(0)
const ownerTokenBalance = ref(0)
const ownerUsdBalance = ref(0)
const owner = ref(undefined as unknown as db.Owner)

const nativeTokenId = ref(0)

onMounted(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  nativeTokenId.value = (await dbTokenBridge.value?.nativeToken())?.id as number
})

</script>
