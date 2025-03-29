<template>
  <q-card flat class='full-width page-x-padding vertical-menus-margin row'>
    <q-space />
    <div class='transfer-card'>
      <div class='row'>
        <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer' @click='onBackClick' />
        <q-space />
        <p class='text-center text-bold text-grey-9 selector-title'>
          {{ $t('MSG_TRANSFER_TOKENS') }}
        </p>
        <q-space />
        <div v-show='false'>
          <q-icon
            name='bi-x' size='24px' class='cursor-pointer'
            @click='onBackClick'
          />
        </div>
      </div>
      <div v-if='step === 1' class='full-width'>
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
          v-model:selected-token='selectedToken'
        />
      </div>
      <div v-if='step === 2' class='full-width'>
        <SetTranserAmount
          :from-owner='selectedFromOwner'
          :from-microchain='selectedFromMicrochain'
          :token='selectedToken'
          v-model:from-chain-balance='fromChainBalance'
          @next='onSetTransferAmountNext'
          v-model='amount'
        />
      </div>
      <div v-if='step === 3' class='full-width'>
        <ConfirmTransfer
          :token='selectedToken'
          :from-owner='selectedFromOwner'
          :from-microchain='selectedFromMicrochain'
          :to-owner='selectedToOwner'
          :to-microchain='selectedToMicrochain'
          :to-address='toAddress'
          :to-microchain-id='toMicrochain'
          :from-chain-balance='fromChainBalance'
          :to-chain-balance='toChainBalance'
          :amount='amount'
          :transferring='transferring'
          @confirmed='onTransferConfirmed'
        />
      </div>
    </div>
    <q-space />
  </q-card>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db, rpc } from 'src/model'

import SelectTransferAccount from './SelectTransferAccount.vue'
import SetTranserAmount from './SetTranserAmount.vue'
import ConfirmTransfer from './ConfirmTransfer.vue'
import { dbBridge, rpcBridge } from 'src/bridge'

interface Query {
  fromMicrochainId: string
  applicationId?: string
}

const route = useRoute()
const fromMicrochainId = ref((route.query as unknown as Query).fromMicrochainId)
const applicationId = ref((route.query as unknown as Query).applicationId)

const step = ref(1)

const selectedToken = ref(undefined as unknown as db.Token)
const selectedFromOwner = ref(undefined as unknown as db.Owner)
const selectedFromMicrochain = ref(undefined as unknown as db.Microchain)
const selectedToOwner = ref(undefined as unknown as db.Owner)
const selectedToMicrochain = ref(undefined as unknown as db.Microchain)
const toAddress = ref('')
const toMicrochain = ref('')
const fromChainBalance = ref(false)
const toChainBalance = ref(false)
const amount = ref(0)
const transferring = ref(false)

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

const onTransferConfirmed = async () => {
  transferring.value = true
  try {
    if (!selectedToken.value.native) {
      const chainAccountOwner = {
        chainId: selectedToMicrochain.value?.microchain || toMicrochain.value,
        owner: `User:${selectedToOwner.value?.owner || await db.ownerFromPublicKey(toAddress.value)}`
      } as rpc.Account
      const operationId = await rpcBridge.MemeApplicationOperation.transfer(
        selectedFromMicrochain.value?.microchain,
        selectedToken.value.applicationId as string,
        chainAccountOwner, amount.value)
      await rpcBridge.Operation.waitOperation(operationId)
    } else {
      const operationId = await rpcBridge.Operation.transfer(
        fromChainBalance.value ? undefined : selectedFromOwner.value?.address,
        selectedFromMicrochain.value?.microchain,
        toChainBalance.value ? undefined : selectedToOwner.value?.address || toAddress.value,
        selectedToMicrochain.value?.microchain || toMicrochain.value,
        amount.value
      )
      await rpcBridge.Operation.waitOperation(operationId)
    }
  } catch (e) {
    console.log('Failed transfer', e)
  }
  transferring.value = false
  void router.back()
}

onMounted(async () => {
  if (fromMicrochainId.value) {
    selectedFromMicrochain.value = await dbBridge.Microchain.microchain(fromMicrochainId.value) as db.Microchain
  }
  if (applicationId.value) {
    selectedToken.value = await dbBridge.Token.token(applicationId.value) as db.Token
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    selectedToken.value = await dbBridge.Token.native() as db.Token
  }
})

</script>
