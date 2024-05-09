<template>
  <div class='row' :style='{marginTop: "48px"}'>
    <q-space />
    <div>
      <div
        class='row'
        :style='{
          margin: "8px 0",
          padding: "8px 24px",
          background: "rgba(255, 100, 100, 0.2)",
          borderRadius: "8px"
        }'
      >
        <div
          :style='{
            width: "640px",
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
        v-for='chainId in microchains.keys()'
        :key='chainId'
        class='row'
        :style='{
          margin: "8px 0",
          padding: "24px",
          background: "rgba(255, 0, 0, 0.05)",
          borderRadius: "8px",
          fontSize: "16px",
          lineHeight: "36px"
        }'
      >
        <div
          :style='{
            width: "640px",
            color: "#555555"
          }'
          class='row'
        >
          <span>{{ chainId }}</span>
          <q-icon
            name='content_copy'
            size='16px'
            color='grey'
            :style='{
              margin: "10px 8px"
            }'
            class='cursor-pointer'
            @click='onCopyChainIdClick(chainId)'
          />
        </div>
        <div
          :style='{
            width: "200px",
            color: "#555555"
          }'
        >
          {{ _wallet.accountBalance(undefined, chainId).toFixed(6) }} <strong>TLINERA</strong>
        </div>
        <div
          :style='{
            width: "200px",
            color: "#555555"
          }'
        >
          {{ _wallet.chainBalance(undefined, chainId).toFixed(6) }} <strong>TLINERA</strong>
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
            class='text-grey-6'
          />
        </div>
      </div>
    </div>
    <q-space />
  </div>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import { wallet, notify } from 'src/localstores'
import { copyToClipboard } from 'quasar'
import { useRouter } from 'vue-router'

const _wallet = wallet.useWalletStore()
const microchains = computed(() => _wallet.currentChains)

const notification = notify.useNotificationStore()

const router = useRouter()

const onTransferClick = (chainId: string) => {
  void router.push({
    path: '/transfer',
    query: {
      chainId
    }
  })
}

const onCloseClick = (chainId: string) => {
  console.log(chainId)
}

const onCopyChainIdClick = (chainId: string) => {
  copyToClipboard(chainId)
    .then(() => {
      notification.pushNotification({
        Title: 'Copy Chain Id',
        Message: `Success copy chain id ${chainId} to clipboard.`,
        Popup: true,
        Type: notify.NotifyType.Info
      })
    })
    .catch((e) => {
      console.log('Fail copy chain id', e)
    })
}

</script>
