<template>
  <div class='full-width'>
    <div class='transfer-amount-space' />
    <div class='row text-center'>
      <q-space />
      <q-input
        class='label-text-extra-large text-right' dense v-model='amount' :style='{ width: inputWidth, minWidth: "16px", maxWidth: "calc(100% - 42px)" }'
        autofocus type='number'
      />
      <div class='label-text-extra-large page-item-x-margin-left'>
        {{ token.ticker }}
      </div>
      <q-space />
    </div>
    <div class='transfer-amount-space' />
    <div class='row tip info-bg vertical-sections-margin flax items-center justify-center'>
      <q-avatar>
        <q-img :src='tokenLogo' width='36px' height='36px' fit='contain' />
      </q-avatar>
      <div class='page-item-x-margin-left'>
        <div v-if='token.native' class='row'>
          <div class='text-grey-8'>
            {{ fromChainBalance ? 'Chain balance' : 'Account balance' }}
          </div>
          <div class='page-item-x-margin-left cursor-pointer' @click='onChangeFromBalanceClick'>
            <q-icon name='bi-arrow-down-up' size='12px' />
          </div>
        </div>
        <div>
          {{ fromChainBalance ? chainTokenBalance : accountTokenBalance }} {{ token.ticker }}
        </div>
      </div>
      <q-space />
      <div class='cursor-pointer text-blue-6' @click='onMaxAmountClick'>
        {{ $t('MSG_MAX') }}
      </div>
      <div class='page-item-x-margin-left' />
    </div>
    <div class='page-y-padding'>
      <q-btn
        flat
        rounded
        :label='$t("MSG_CONTINUE")'
        class='btn full-width extra-margin-bottom'
        @click='onContinueClick'
        no-caps
        :disable='amount <= 0'
      />
    </div>
  </div>
  <TokenBridge ref='dbTokenBridge' />
  <MicrochainOwnerBalanceBridge
    :owner='fromOwner.owner' :microchain-id='fromMicrochain.microchain' :token-id='token.id'
    v-model:token-balance='accountTokenBalance'
  />
  <MicrochainBalanceBridge :microchain-id='fromMicrochain.microchain' :token-id='token.id' v-model:token-balance='chainTokenBalance' />
</template>

<script setup lang='ts'>
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { dbModel } from 'src/model'

import MicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import MicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import TokenBridge from '../bridge/db/TokenBridge.vue'
import { dbBridge } from 'src/bridge'

interface Props {
  fromOwner: dbModel.Owner
  fromMicrochain: dbModel.Microchain
  token: dbModel.Token
}
const props = defineProps<Props>()
const fromOwner = toRef(props, 'fromOwner')
const fromMicrochain = toRef(props, 'fromMicrochain')
const token = toRef(props, 'token')

const amount = defineModel<number>({ default: 0 })
const fromChainBalance = defineModel<boolean>('fromChainBalance')

watch(amount, () => {
  if (amount.value.toString().startsWith('0.0')) {
    if (!amount.value.toString().match(/[1-9]/)) {
      return
    }
  }
  amount.value = Math.min(fromChainBalance.value ? chainTokenBalance.value : accountTokenBalance.value, Number(amount.value))
})

const inputWidth = computed(() => ((Math.max(Math.min(amount.value.toString().length, 8), 2)) * 16).toString() + 'px')

const chainTokenBalance = ref(0)
const accountTokenBalance = ref(0)
const tokenLogo = ref('')

const dbTokenBridge = ref<InstanceType<typeof TokenBridge>>()

const emit = defineEmits<{(ev: 'next'): void}>()

const onChangeFromBalanceClick = () => {
  fromChainBalance.value = !fromChainBalance.value
}

const onMaxAmountClick = () => {
  amount.value = fromChainBalance.value ? chainTokenBalance.value : accountTokenBalance.value
}

const onContinueClick = () => {
  emit('next')
}

onMounted(async () => {
  tokenLogo.value = await dbBridge.Token.logo(token.value.id as number) as string
})

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
