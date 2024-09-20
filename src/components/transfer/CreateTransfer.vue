<template>
  <q-card flat class='full-width page-x-padding vertical-menus-margin transfer-card'>
    <div class='row'>
      <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer' @click='onBackClick' />
      <q-space />
      <p class='text-center text-bold text-grey-9 selector-title'>
        Transfer tokens
      </p>
      <q-space />
      <div v-show='false'>
        <q-icon
          name='bi-x' size='24px' class='cursor-pointer'
          @click='onBackClick'
        />
      </div>
    </div>
    <div v-if='step === 1'>
      <SelectTransferAccount
        @next='onSelectTransferAccountNext'
        v-model:selected-from-owner='selectedFromOwner'
        v-model:selected-from-microchain='selectedFromMicrochain'
        v-model:selected-to-owner='selectedToOwner'
        v-model:selected-to-microchain='selectedToMicrochain'
        v-model:to-address='toAddress'
        v-model:to-microchain='toMicrochain'
        v-model:from-chain-balance='fromChainBalance'
        v-model:to-chain-balance='toChainBalance'
      />
    </div>
    <div v-if='step === 2'>
      <SetTranserAmount
        :from-owner='selectedFromOwner' :from-microchain='selectedFromMicrochain' :from-chain-balance='fromChainBalance' @next='onSetTransferAmountNext'
        v-model='amount'
      />
    </div>
  </q-card>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { db } from 'src/model'

import SelectTransferAccount from './SelectTransferAccount.vue'
import SetTranserAmount from './SetTranserAmount.vue'

const step = ref(1)

const selectedFromOwner = ref(undefined as unknown as db.Owner)
const selectedFromMicrochain = ref(undefined as unknown as db.Microchain)
const selectedToOwner = ref(undefined as unknown as db.Owner)
const selectedToMicrochain = ref(undefined as unknown as db.Microchain)
const toAddress = ref('')
const toMicrochain = ref('')
const fromChainBalance = ref(false)
const toChainBalance = ref(false)
const amount = ref(0)

const router = useRouter()

const onSelectTransferAccountNext = () => {
  step.value++
}

const onSetTransferAmountNext = () => {
  step.value++
}

const onBackClick = () => {
  if (step.value > 1) return step.value--
  void router.back()
}

</script>
