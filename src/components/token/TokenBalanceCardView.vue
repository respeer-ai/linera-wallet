<template>
  <div>
    <q-item class='row full-width tab-panel-item'>
      <div>
        <div v-if='_microchain'>
          <div class='word-break-all'>
            {{ _microchain.microchain }}
          </div>
          <div class='row'>
            <q-img :src='microchainLogo' width='16px' height='16px' />
            <q-avatar size='16px' class='page-item-x-margin-left'>
              <q-img :src='db.microchainAvatar(_microchain)' width='16px' height='16px' />
            </q-avatar>
          </div>
        </div>
        <div v-if='selectedOwner' class='vertical-items-margin'>
          <div class='word-break-all'>
            {{ selectedOwner.owner }}
          </div>
          <div class='row'>
            <q-avatar size='16px'>
              <q-img v-if='selectedOwner' :src='db.ownerAvatar(selectedOwner)' width='16px' height='16px' />
            </q-avatar>
          </div>
        </div>
      </div>
      <q-space />
      <div class='selector-margin-x-left'>
        <div class='text-bold text-grey-9 text-right'>
          {{ parseFloat(tokenBalance.toFixed(4)) }} <span class='selector-item-currency-sub'>{{ token.ticker }}</span>
        </div>
        <div class='text-right'>
          $ {{ parseFloat(usdBalance.toFixed(2)) }} <span class='text-grey-6 selector-item-currency-sub'>{{ $t('MSG_USD') }}</span>
        </div>
      </div>
      <DbOwnerBridge v-model:selected-owner='selectedOwner' />
    </q-item>
    <q-separator />
  </div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, onMounted, ref, toRef } from 'vue'
import { dbBridge } from 'src/bridge'

import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'

import { microchainLogo } from 'src/assets'

interface Props {
  token: db.Token
  chainBalance?: db.MicrochainFungibleTokenBalance
  ownerBalance?: db.MicrochainOwnerFungibleTokenBalance
}
const props = withDefaults(defineProps<Props>(), {
  chainBalance: undefined,
  ownerBalance: undefined
})
const token = toRef(props, 'token')
const chainBalance = toRef(props, 'chainBalance')
const ownerBalance = toRef(props, 'ownerBalance')

const tokenBalance = computed(() => chainBalance.value?.balance || ownerBalance.value?.balance || 0)
const usdBalance = computed(() => tokenBalance.value * token.value.usdCurrency || 0)
const microchain = computed(() => chainBalance.value?.microchain || ownerBalance.value?.microchain)

const selectedOwner = ref(undefined as unknown as db.Owner)
const _microchain = ref(undefined as unknown as db.Microchain)

onMounted(async () => {
  _microchain.value = await dbBridge.Microchain.microchain(microchain.value as string) as db.Microchain
})

</script>
