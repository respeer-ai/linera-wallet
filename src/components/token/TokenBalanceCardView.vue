<template>
  <div :style='{ paddingLeft: xPadding, paddingRight: xPadding }'>
    <div class='full-width tab-panel-item'>
      <div>
        <div v-if='_microchain' class='row decorate-underline-dashed'>
          <div class='row'>
            <q-img :src='microchainLogo' width='20px' height='20px' />
            <q-avatar size='20px' class='page-item-x-margin-left'>
              <q-img :src='dbModel.microchainAvatar(_microchain)' width='20px' height='20px' />
            </q-avatar>
          </div>
          <div class='word-break-all page-item-x-margin-left' :style='{width: "calc(100% - 52px)"}'>
            {{ _microchain.microchain }}
          </div>
        </div>
        <div v-if='owner && selectedOwner' class='vertical-items-margin row decorate-underline-dashed'>
          <div class='row'>
            <q-avatar size='20px'>
              <q-img v-if='owner && selectedOwner' :src='dbModel.ownerAvatar(selectedOwner)' width='20px' height='20px' />
            </q-avatar>
            <div :style='{marginLeft: "20px"}' />
          </div>
          <div class='word-break-all page-item-x-margin-left' :style='{width: "calc(100% - 52px)"}'>
            {{ selectedOwner.owner }}
          </div>
        </div>
      </div>
      <div class='row vertical-items-margin'>
        <q-space />
        <div class='text-bold text-grey-9'>
          {{ parseFloat(tokenBalance.toFixed(4)) }} <span class='selector-item-currency-sub'>{{ token.ticker }}</span>
        </div>
        <div class='page-item-x-margin-left'>
          ≈
        </div>
        <div class='page-item-x-margin-left'>
          $ {{ parseFloat(usdBalance.toFixed(2)) }} <span class='text-grey-6 selector-item-currency-sub'>{{ $t('MSG_USD') }}</span>
        </div>
      </div>
      <DbOwnerBridge v-model:selected-owner='selectedOwner' />
    </div>
    <q-separator />
  </div>
</template>

<script setup lang='ts'>
import { dbModel } from 'src/model'
import { computed, onMounted, ref, toRef } from 'vue'
import { dbBridge } from 'src/bridge'

import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'

import { microchainLogo } from 'src/assets'

interface Props {
  token: dbModel.Token
  chainBalance?: dbModel.MicrochainFungibleTokenBalance
  ownerBalance?: dbModel.MicrochainOwnerFungibleTokenBalance
  xPadding?: string
}
const props = withDefaults(defineProps<Props>(), {
  chainBalance: undefined,
  ownerBalance: undefined,
  xPadding: '0'
})
const token = toRef(props, 'token')
const chainBalance = toRef(props, 'chainBalance')
const ownerBalance = toRef(props, 'ownerBalance')
const xPadding = toRef(props, 'xPadding')

const tokenBalance = computed(() => chainBalance.value?.balance || ownerBalance.value?.balance || 0)
const usdBalance = computed(() => tokenBalance.value * token.value.usdCurrency || 0)
const microchain = computed(() => chainBalance.value?.microchain || ownerBalance.value?.microchain)
const owner = computed(() => ownerBalance.value?.owner)

const selectedOwner = ref(undefined as unknown as dbModel.Owner)
const _microchain = ref(undefined as unknown as dbModel.Microchain)

onMounted(async () => {
  _microchain.value = await dbBridge.Microchain.microchain(microchain.value as string) as dbModel.Microchain
})

</script>
