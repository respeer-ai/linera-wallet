<template>
  <div
    class='row'
    :style='{
      margin: "8px 16px 8px 16px",
      padding: "8px 24px",
      background: "rgba(255, 100, 100, 0.2)",
      borderRadius: "8px"
    }'
  >
    <div
      :style='{
        width: "800px",
        fontWeight: 600
      }'
    >
      CHAIN ID
    </div>
    <div
      :style='{
        width: "200px",
        fontWeight: 600
      }'
    >
      BALANCE
    </div>
    <div
      :style='{
        width: "200px",
        fontWeight: 600
      }'
    >
      CHAIN BALANCE
    </div>
    <div
      :style='{
        width: "200px",
        fontWeight: 600,
        paddingLeft: "4px"
      }'
    >
      OPERATIONS
    </div>
  </div>
  <div
    v-for='chainId in chains.keys()'
    :key='chainId'
    class='row'
    :style='{
      margin: "8px 16px 16px 16px",
      padding: "24px",
      background: "rgba(255, 0, 0, 0.05)",
      borderRadius: "8px",
      fontSize: "16px",
      lineHeight: "36px"
    }'
  >
    <div
      :style='{
        width: "800px",
        color: "#555555"
      }'
      class='row'
    >
      <span>{{ chainId }}</span>
      <q-icon name='copy' />
    </div>
    <div
      :style='{
        width: "200px",
        color: "#555555"
      }'
    >
      {{ Number(chains.get(chainId))?.toFixed(6) }} <strong>LINERA</strong>
    </div>
    <div
      :style='{
        width: "200px",
        color: "#555555"
      }'
    >
      {{ Number(chainBalances.get(chainId))?.toFixed(6) }} <strong>LINERA</strong>
    </div>
    <div
      :style='{
        width: "200px",
        color: "#555555"
      }'
      class='row'
    >
      <q-btn
        dense
        rounded
        flat
        label='Transfer'
        @click='onTransferClick(chainId)'
        class='text-blue-6'
      />
      <q-btn
        dense
        rounded
        flat
        label='Close'
        @click='onCloseClick(chainId)'
        class='text-blue-6'
      />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import { wallet } from 'src/localstores'

const _wallet = wallet.useWalletStore()
const chains = computed(() => _wallet.currentChains)
const chainBalances = computed(() => _wallet._chainBalances)

const onTransferClick = (chainId: string) => {
  console.log(chainId)
}

const onCloseClick = (chainId: string) => {
  console.log(chainId)
}

</script>
