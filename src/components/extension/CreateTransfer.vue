<template>
  <q-card flat :style='{overflow: "hidden"}'>
    <div
      class='text-brown-10'
      :style='{
        margin: "0 0 8px 0",
        fontSize: "20px",
        opacity: 0.8
      }'
    >
      From
    </div>
    <q-select
      dense
      v-model='fromAddress'
      :style='{
        height: "48px",
      }'
      disable
      :label='fromChainBalance ? "Send from microchain balance" : "From address"'
    >
      <template #selected-item='scope'>
        <span class='ellipsis'>{{ scope.opt }}</span>
      </template>
    </q-select>
    <q-select
      dense
      v-model='fromChainId'
      :options='fromChains'
      :style='{
        height: "48px",
      }'
      :disable='queryChainId !== undefined'
      label='From microchain'
    >
      <template #selected-item='scope'>
        <span class='ellipsis'>{{ scope.opt }}</span>
      </template>
    </q-select>
    <q-toggle
      dense
      rounded
      label='Send From Microchain Balance'
      v-model='fromChainBalance'
      class='text-brown-10'
      :style='{
        margin: "8px 0",
      }'
    />
    <div
      class='text-brown-10'
      :style='{
        margin: "16px 0 16px 0",
        fontSize: "20px",
        opacity: 0.8,
        marginTop: "24px"
      }'
    >
      Amount
    </div>
    <q-input
      dense
      v-model='amount'
      type='number'
      :style='{
        height: "48px",
      }'
    >
      <template #append>
        <q-btn
          dense
          flat
          label='MAX AMOUNT'
          class='text-blue-4'
          @click='onMaxAmountClick'
        />
      </template>
    </q-input>
    <div
      class='text-brown-10'
      :style='{
        margin: "16px 0 16px 0",
        fontSize: "20px",
        opacity: 0.8,
        marginTop: "48px"
      }'
    >
      To
    </div>
    <q-select
      dense
      v-model='targetAddress'
      :options='targetAddresses'
      :style='{
        height: "48px",
      }'
      use-input
      :label='toChainBalance ? "Send to microchain balance" : "Target address (enter for new address)"'
      clearable
      new-value-mode='add-unique'
    >
      <template #selected-item='scope'>
        <span class='ellipsis'>{{ scope.opt }}</span>
      </template>
    </q-select>
    <q-select
      dense
      v-model='targetChainId'
      :options='targetChains'
      :style='{
        height: "48px",
      }'
      use-input
      label='Target microchain (enter for new chain)'
      clearable
      new-value-mode='add-unique'
    >
      <template #selected-item='scope'>
        <span class='ellipsis'>{{ scope.opt }}</span>
      </template>
    </q-select>
    <div>
      <q-toggle
        dense
        rounded
        label='Send To Microchain Balance'
        v-model='toChainBalance'
        class='text-brown-10'
        :style='{
          margin: "8px 0",
        }'
      />
    </div>
    <q-btn
      rounded
      label='Transfer'
      class='text-brown-10 bg-red-1 full-width'
      :style='{
        margin: "24px 0"
      }'
      @click='onTransferClick'
    />
  </q-card>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'
import { wallet, notify } from 'src/localstores'
import { useRoute } from 'vue-router'
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import { _hex, endpoint } from 'src/utils'

const _wallet = wallet.useWalletStore()
const fromChainBalance = ref(false)
const fromAddress = computed(() => _wallet.currentAddress)
const fromChains = computed(() => Array.from(_wallet.currentChains.keys()))

const notification = notify.useNotificationStore()

interface Query {
  chainId: string
}
const route = useRoute()
const queryChainId = ref((route.query as unknown as Query).chainId)
const fromChainId = ref(queryChainId.value)
const amount = ref(0)

const toChainBalance = ref(false)
const targetAddresses = computed(() => Array.from(_wallet.accounts.keys()))
const targetAddress = ref(undefined as unknown as string)
const targetChains = computed(() => Array.from(_wallet.accountChains(targetAddress.value).keys()))
const targetChainId = ref('')

const onMaxAmountClick = () => {
  amount.value = fromChainBalance.value ? _wallet.chainBalance(undefined, fromChainId.value) : _wallet.accountBalance(undefined, fromChainId.value)
}

const transfer = async (fromPublicKey: string | undefined, fromChainId: string, toPublicKey: string | undefined, toChainId: string, amount: number, userData?: string, done?: () => void) => {
  const options = getClientOptions(endpoint.rpcSchema, endpoint.rpcWsSchema, endpoint.rpcHost, endpoint.rpcPort)
  const apolloClient = new ApolloClient(options)

  const userDataBytes = userData ? _hex.toBytes(userData) : undefined

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation transfer ($fromPublicKey: String, $fromChainId: String!, $toPublicKey: String, $toChainId: String!, $amount: String!, $userData: String) {
      transferWithoutBlockProposal(fromPublicKey: $fromPublicKey, fromChainId: $fromChainId, toPublicKey: $toPublicKey, toChainId: $toChainId, amount: $amount, userData: $userData)
    }`))
  onDone(() => {
    done?.()
  })
  onError((error) => {
    notification.pushNotification({
      Title: 'Transfer',
      Message: `Fail transfer ${amount} TLINERA to ${toPublicKey as string} on ${toChainId}: ${error.message}.`,
      Popup: true,
      Type: notify.NotifyType.Error
    })
  })
  await mutate({
    fromPublicKey,
    fromChainId,
    toPublicKey,
    toChainId,
    amount,
    userData: userDataBytes
  })
}

const onTransferClick = () => {
  void transfer(
    fromChainBalance.value ? undefined : fromAddress.value,
    fromChainId.value,
    toChainBalance.value ? undefined : targetAddress.value,
    targetChainId.value,
    amount.value,
    undefined,
    () => {
      notification.pushNotification({
        Title: 'Transfer',
        Message: `Success transfer ${amount.value} TLINERA to ${targetAddress.value} on ${targetChainId.value}.`,
        Popup: true,
        Type: notify.NotifyType.Info
      })
    }
  )
}

</script>
