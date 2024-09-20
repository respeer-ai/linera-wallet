<template>
  <div class='full-width'>
    <div class='row text-center vertical-sections-margin'>
      <q-space />
      <div class='row vertical-sections-margin'>
        <q-input
          class='label-text-extra-large' dense v-model='amount' :style='{ width: inputWidth }'
          autofocus type='number'
        />
        <div class='label-text-extra-large page-item-x-margin-left'>
          TLINERA
        </div>
      </div>
      <q-space />
    </div>
    <div class='transfer-amount-space' />
    <div class='row tip info-bg vertical-sections-margin flax items-center justify-center'>
      <q-avatar>
        <q-img :src='lineraLogo' width='36px' height='36px' />
      </q-avatar>
      <div class='page-item-x-margin-left'>
        <div class='row'>
          <div class='text-grey-8'>
            {{ fromChainBalance ? 'Chain balance' : 'Account balance' }}
          </div>
          <div class='page-item-x-margin-left cursor-pointer' @click='onChangeFromBalanceClick'>
            <q-icon name='bi-arrow-down-up' size='16px' />
          </div>
        </div>
        <div>
          {{ fromChainBalance ? chainTokenBalance : accountTokenBalance }} TLINERA
        </div>
      </div>
      <q-space />
      <div class='cursor-pointer text-blue-6' @click='onMaxAmountClick'>
        Max
      </div>
      <div class='page-item-x-margin-left' />
    </div>
    <div class='page-y-padding'>
      <q-btn
        dense
        flat
        rounded
        label='Continue'
        class='btn full-width extra-margin-bottom'
        @click='onContinueClick'
        no-caps
        :disable='amount === 0'
      />
    </div>
  </div>
  <TokenBridge ref='dbTokenBridge' />
  <MicrochainOwnerBalanceBridge
    v-if='nativeTokenId !== undefined' :owner='fromOwner.owner' :microchain-id='fromMicrochain.microchain' :token-id='nativeTokenId'
    v-model:token-balance='accountTokenBalance'
  />
  <MicrochainBalanceBridge v-if='nativeTokenId !== undefined' :microchain-id='fromMicrochain.microchain' :token-id='nativeTokenId' v-model:token-balance='chainTokenBalance' />
</template>

<script setup lang='ts'>
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { db } from 'src/model'

import MicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import MicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import TokenBridge from '../bridge/db/TokenBridge.vue'

import { lineraLogo } from 'src/assets'

interface Props {
  fromOwner: db.Owner
  fromMicrochain: db.Microchain
}
const props = defineProps<Props>()
const fromOwner = toRef(props, 'fromOwner')
const fromMicrochain = toRef(props, 'fromMicrochain')

const amount = defineModel<number>({ default: 0 })
const fromChainBalance = defineModel<boolean>('fromChainBalance')

watch(amount, () => {
  amount.value = Math.min(fromChainBalance.value ? chainTokenBalance.value : accountTokenBalance.value, Number(amount.value))
})

const inputWidth = computed(() => ((Math.max(Math.min(amount.value.toString().length, 8), 1)) * 16).toString() + 'px')

const chainTokenBalance = ref(0)
const accountTokenBalance = ref(0)

const nativeTokenId = ref(undefined as unknown as number)

const dbTokenBridge = ref<InstanceType<typeof TokenBridge>>()

const emit = defineEmits<{(ev: 'next'): void}>()

onMounted(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  nativeTokenId.value = (await dbTokenBridge.value?.nativeToken())?.id as number
})

const onChangeFromBalanceClick = () => {
  fromChainBalance.value = !fromChainBalance.value
}

const onMaxAmountClick = () => {
  amount.value = fromChainBalance.value ? chainTokenBalance.value : accountTokenBalance.value
}

const onContinueClick = () => {
  emit('next')
}

</script>

<style scoped lang='sass'>
::v-deep .q-field--standard .q-field__control:after
  background: none !important

::v-deep .q-field--standard .q-field__control:before
  border-bottom: none !important

::v-deep .q-field__native
  min-width: 28px
  max-width: 128px

/* Chrome, Safari, Edge, Opera */
::v-deep input::-webkit-outer-spin-button
  -webkit-appearance: none
  margin: 0

::v-deep input::-webkit-inner-spin-button
  -webkit-appearance: none
  margin: 0

/* Firefox */
::v-deep input[type=number]
  -moz-appearance: textfield
</style>
