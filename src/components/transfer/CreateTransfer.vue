<template>
  <q-card flat class='full-width page-x-padding vertical-menus-margin row'>
    <q-space />
    <div class='transfer-card'>
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
          v-model:from-chain-balance='fromChainBalance'
          @next='onSetTransferAmountNext'
          v-model='amount'
        />
      </div>
      <div v-if='step === 3' class='full-width'>
        <ConfirmTransfer
          :from-owner='selectedFromOwner'
          :from-microchain='selectedFromMicrochain'
          :to-owner='selectedToOwner'
          :to-microchain='selectedToMicrochain'
          :to-address='toAddress'
          :to-microchain-id='toMicrochain'
          :from-chain-balance='fromChainBalance'
          :to-chain-balance='toChainBalance'
          :amount='amount'
          @confirmed='onTransferConfirmed'
        />
      </div>
    </div>
    <q-space />
  </q-card>
  <RpcOperationBridge ref='rpcOperationBridge' />
  <DbMicrochainBridge ref='dbMicrochainBridge' />
  <RpcERC20ApplicationOperationBridge ref='rpcERC20ApplicationOperationBridge' />
  <DbTokenBridge ref='dbTokenBridge' />
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db, rpc } from 'src/model'

import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import SelectTransferAccount from './SelectTransferAccount.vue'
import SetTranserAmount from './SetTranserAmount.vue'
import ConfirmTransfer from './ConfirmTransfer.vue'
import RpcOperationBridge from '../bridge/rpc/OperationBridge.vue'
import RpcERC20ApplicationOperationBridge from '../bridge/rpc/ERC20ApplicationOperationBridge.vue'
import DbTokenBridge from '../bridge/db/TokenBridge.vue'

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

const router = useRouter()
const rpcOperationBridge = ref<InstanceType<typeof RpcOperationBridge>>()
const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()
const rpcERC20ApplicationOperationBridge = ref<InstanceType<typeof RpcERC20ApplicationOperationBridge>>()
const dbTokenBridge = ref<InstanceType<typeof DbTokenBridge>>()

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
  if (!applicationId.value) {
    const chainAccountOwner = {
      chain_id: selectedToMicrochain.value?.microchain,
      owner: `User:${selectedToOwner.value?.owner}`
    } as rpc.ChainAccountOwner
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await rpcERC20ApplicationOperationBridge.value?.mint(
      selectedFromMicrochain.value?.microchain,
      applicationId.value as string,
      chainAccountOwner, amount.value)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await rpcOperationBridge.value?.transfer(
      fromChainBalance.value ? undefined : selectedFromOwner.value?.address,
      selectedFromMicrochain.value?.microchain,
      toChainBalance.value ? undefined : selectedToOwner.value?.address,
      selectedToMicrochain.value?.microchain,
      amount.value
    )
  }
  void router.back()
}

onMounted(async () => {
  if (fromMicrochainId.value) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    selectedFromMicrochain.value = await dbMicrochainBridge.value?.getMicrochain(fromMicrochainId.value) as db.Microchain
  }
  if (applicationId.value) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    selectedToken.value = await dbTokenBridge.value?.token(applicationId.value) as db.Token
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    selectedToken.value = await dbTokenBridge.value?.nativeToken() as db.Token
  }
})

</script>
