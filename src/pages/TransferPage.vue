<template>
  <div class='row' :style='{margin: "48px"}'>
    <q-space />
    <q-card
      :style='{
        padding: "48px",
        borderRadius: "16px"
      }'
    >
      <div
        class='text-brown-10'
        :style='{
          margin: "16px 0 16px 0",
          fontSize: "20px",
          opacity: 0.8,
          width: "80px"
        }'
      >
        From
      </div>
      <q-select
        dense
        v-model='fromAddress'
        :style='{
          height: "48px",
          width: "640px"
        }'
        disable
        :label='fromChainBalance ? "Send from microchain balance" : "From address"'
      />
      <q-select
        dense
        v-model='fromChainId'
        :options='fromChains'
        :style='{
          height: "48px",
          width: "640px"
        }'
        :disable='queryChainId !== undefined'
        label='From microchain'
      />
      <q-toggle
        dense
        rounded
        label='Send From Microchain Balance'
        v-model='fromChainBalance'
        class='text-brown-10'
        :style='{
          margin: "8px 0",
          width: "640px"
        }'
      />
      <div
        class='text-brown-10'
        :style='{
          margin: "16px 0 16px 0",
          fontSize: "20px",
          opacity: 0.8,
          width: "80px",
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
          width: "640px"
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
          width: "80px",
          marginTop: "48px"
        }'
      >
        To
      </div>
      <q-select
        dense
        v-model='targetAddress'
        :style='{
          height: "48px",
          width: "640px"
        }'
        use-input
        :label='toChainBalance ? "Send to microchain balance" : "Target address (press enter if input new address manually)"'
        clearable
        new-value-mode='add-unique'
      />
      <q-select
        dense
        v-model='targetChainId'
        :options='targetChains'
        :style='{
          height: "48px",
          width: "640px"
        }'
        use-input
        fill-input
        label='Target microchain (press enter if input new chain id manually)'
        clearable
        new-value-mode='add-unique'
      />
      <div>
        <q-toggle
          dense
          rounded
          label='Send To Microchain Balance'
          v-model='toChainBalance'
          class='text-brown-10'
          :style='{
            margin: "8px 0",
            width: "640px"
          }'
        />
      </div>
      <q-btn
        rounded
        label='Transfer'
        class='text-brown-10 bg-red-1'
        :style='{
          margin: "24px 0",
          width: "640px"
        }'
        @click='onTransferClick'
      />
    </q-card>
    <q-space />
  </div>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'
import { wallet } from 'src/localstores'
import { useRoute } from 'vue-router'
import { getClientOptions } from 'src/apollo'
import { ApolloClient, gql } from '@apollo/client/core'
import { provideApolloClient, useMutation } from '@vue/apollo-composable'
import * as constant from 'src/const'
import { _hex } from 'src/utils'
// eslint-disable-next-line camelcase
import { sha3_256 } from 'js-sha3'

const _wallet = wallet.useWalletStore()
const fromChainBalance = ref(false)
const fromAddress = computed(() => _wallet.currentAddress)
const fromChains = computed(() => Array.from(_wallet.currentChains.keys()))

interface Query {
  chainId: string
}
const route = useRoute()
const queryChainId = ref((route.query as unknown as Query).chainId)
const fromChainId = ref(queryChainId.value)
const amount = ref(0)

const toChainBalance = ref(false)
const targetAddress = ref(undefined as unknown as string)
const targetChains = computed(() => Array.from(_wallet.accountChains(targetAddress.value).keys()))
const targetChainId = ref('')

const onMaxAmountClick = () => {
  amount.value = fromChainBalance.value ? _wallet.chainBalance(undefined, fromChainId.value) : _wallet.accountBalance(undefined, fromChainId.value)
}

const transfer = async (publicKey: string | undefined, chainId: string, targetPublicKey: string | undefined, targetChainId: string, amount: number, userData?: string, done?: () => void) => {
  const options = getClientOptions(constant.rpcSchema, constant.rpcWsSchema, constant.rpcHost, constant.rpcPort)
  const apolloClient = new ApolloClient(options)

  const fromOwner = publicKey ? 'User:' + sha3_256(_hex.toBytes(publicKey)) : undefined
  const toOwner = targetPublicKey ? 'User:' + sha3_256(_hex.toBytes(targetPublicKey)) : undefined
  // TODO: targetPublicKey, targetChainId -> recipient
  const recipient = {
    Account: {
      chain_id: targetChainId,
      owner: toOwner
    }
  }
  // TODO: userData to bytes
  const userDataBytes = userData ? _hex.toBytes(userData) : undefined

  const { mutate, onDone, onError } = provideApolloClient(apolloClient)(() => useMutation(gql`
    mutation transfer ($owner: String, $chainId: String!, $recipient: Account!, $amount: String!, $userData: String) {
      transfer(owner: $owner, chainId: $chainId, recipient: $recipient, amount: $amount, userData: $userData)
    }`))
  onDone((res) => {
    console.log(res)
    done?.()
  })
  onError((error) => {
    console.log('Fail open chain for ', publicKey, error)
  })
  await mutate({
    owner: fromOwner,
    chainId,
    recipient,
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
    amount.value
  )
}

</script>
