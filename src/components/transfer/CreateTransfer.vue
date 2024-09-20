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
        :from-owner='selectedFromOwner'
        :from-microchain='selectedFromMicrochain'
        v-model:from-chain-balance='fromChainBalance'
        @next='onSetTransferAmountNext'
        v-model='amount'
      />
    </div>
    <div v-if='step === 3'>
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
  </q-card>
  <RpcTransferBridge ref='rpcTransferBridge' />
  <DbMicrochainBridge ref='dbMicrochainBridge' />
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from 'src/model'
import { localStore } from 'src/localstores'

import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import SelectTransferAccount from './SelectTransferAccount.vue'
import SetTranserAmount from './SetTranserAmount.vue'
import ConfirmTransfer from './ConfirmTransfer.vue'
import RpcTransferBridge from '../bridge/rpc/TransferBridge.vue'

interface Query {
  fromMicrochainId: string
}

const route = useRoute()
const fromMicrochainId = ref((route.query as unknown as Query).fromMicrochainId)

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
const rpcTransferBridge = ref<InstanceType<typeof RpcTransferBridge>>()
const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()

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

const onTransferConfirmed = () => {
  console.log(fromChainBalance.value, toChainBalance.value)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  rpcTransferBridge.value?.transfer(
    fromChainBalance.value ? undefined : selectedFromOwner.value?.address,
    selectedFromMicrochain.value?.microchain,
    toChainBalance.value ? undefined : selectedToOwner.value?.address,
    selectedToMicrochain.value?.microchain,
    amount.value,
    undefined
  ).then(() => {
    localStore.notification.pushNotification({
      Title: 'Transfer',
      Message: 'Transaction is successful',
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })
    void router.back()
  }).catch((error) => {
    localStore.notification.pushNotification({
      Title: 'Transfer',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: `Transaction is failed: ${error}`,
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
    void router.back()
  })
}

onMounted(async () => {
  if (fromMicrochainId.value) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    selectedFromMicrochain.value = await dbMicrochainBridge.value?.getMicrochain(fromMicrochainId.value) as db.Microchain
  }
})

</script>
