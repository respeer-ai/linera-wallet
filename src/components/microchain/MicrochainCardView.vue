<template>
  <q-item class='row full-width tab-panel-item' :clickable='clickable' :style='{ paddingLeft: xPadding, paddingRight: xPadding }'>
    <div v-if='showIndicator' :class='[ "selector-indicator", (showSelected ? selected : microchain.default) ? "selector-indicator-selected" : "" ]' />
    <q-avatar :class='[ showIndicator ? "selector-margin-x-left" : "" ]'>
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
          <q-icon name='bi-copy' size='12px' @click.stop='(evt) => _copyToClipboard(microchain.microchain, evt)' />
        </div>
      </div>
      <div class='text-left' v-if='integratedMode'>
        {{ chainTokenBalance }} <span class='text-grey-6 selector-item-currency-sub'>{{ $t('MSG_TEST_LINERA_TOKEN_SYMBOL') }}</span>
      </div>
      <div class='text-left' v-else>
        <span class='text-grey-6 selector-item-currency-sub'>{{ $t('MSG_TEST_LINERA_TOKEN_SYMBOL') }}</span>
      </div>
    </div>
    <q-space />
    <div v-if='integratedMode'>
      <div class='text-bold text-grey-9 text-right'>
        {{ ownerTokenBalance }} <span class='selector-item-currency-sub'>{{ $t('MSG_TEST_LINERA_TOKEN_SYMBOL') }}</span>
      </div>
      <div class='text-right'>
        $ {{ chainUsdBalance + ownerUsdBalance }} <span class='text-grey-6 selector-item-currency-sub'>{{ $t('MSG_USD') }}</span>
      </div>
    </div>
    <div v-else-if='showAccountBalance'>
      <div class='text-right text-bold'>
        $ {{ ownerUsdBalance }} <span class='selector-item-currency-sub'>{{ $t('MSG_USD') }}</span>
      </div>
      <div class='text-grey-9 text-right'>
        {{ ownerTokenBalance }} <span class='text-grey-6 selector-item-currency-sub'>{{ $t('MSG_TEST_LINERA_TOKEN_SYMBOL') }}</span>
      </div>
    </div>
    <div v-else>
      <div class='text-right text-bold'>
        $ {{ chainUsdBalance }} <span class='selector-item-currency-sub'>{{ $t('MSG_USD') }}</span>
      </div>
      <div class='text-grey-9 text-right'>
        {{ chainTokenBalance }} <span class='text-grey-6 selector-item-currency-sub'>{{ $t('MSG_TEST_LINERA_TOKEN_SYMBOL') }}</span>
      </div>
    </div>
    <div v-if='showIndicator' :class='[ "selector-indicator selector-margin-x-left" ]' />
  </q-item>
  <DbMicrochainBalanceBridge
    v-if='nativeTokenId !== undefined' v-model:token-balance='chainTokenBalance' v-model:usd-balance='chainUsdBalance' :token-id='nativeTokenId'
    :microchain-id='microchain.microchain'
  />
  <DbOwnerBridge v-model:selected-owner='owner' />
  <DbMicrochainOwnerBalanceBridge
    v-if='nativeTokenId !== undefined'
    v-model:token-balance='ownerTokenBalance' v-model:usd-balance='ownerUsdBalance' :token-id='nativeTokenId' :microchain-id='microchain.microchain'
    :owner='owner?.owner'
  />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { shortid } from 'src/utils'
import { _copyToClipboard } from 'src/utils/copycontent'

import DbMicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import DbMicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'

import { lineraLogo } from 'src/assets'
import { dbBridge } from 'src/bridge'

interface Props {
  microchain: db.Microchain
  showAccountBalance?: boolean
  integratedMode?: boolean
  showIndicator?: boolean
  clickable?: boolean
  xPadding?: string
  showSelected?: boolean
  selected?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  microchain: undefined,
  showAccountBalance: false,
  integratedMode: true,
  showIndicator: true,
  clickable: true,
  xPadding: '0',
  showSelected: false,
  selected: false
})
const microchain = toRef(props, 'microchain')
const showAccountBalance = toRef(props, 'showAccountBalance')
const integratedMode = toRef(props, 'integratedMode')
const showIndicator = toRef(props, 'showIndicator')
const clickable = toRef(props, 'clickable')
const xPadding = toRef(props, 'xPadding')
const showSelected = toRef(props, 'showSelected')
const selected = toRef(props, 'selected')

const chainTokenBalance = ref(0)
const chainUsdBalance = ref(0)
const ownerTokenBalance = ref(0)
const ownerUsdBalance = ref(0)
const owner = ref(undefined as unknown as db.Owner)

const nativeTokenId = ref(undefined as unknown as number)

onMounted(async () => {
  nativeTokenId.value = (await dbBridge.Token.native())?.id as number
})

</script>
