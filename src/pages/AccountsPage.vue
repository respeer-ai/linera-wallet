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
          borderRadius: "8px",
        }'
      >
        <div
          :style='{
            width: "640px",
            fontWeight: 600
          }'
        >
          ACCOUNT
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
            fontWeight: 600,
            paddingLeft: "4px"
          }'
        >
          OPERATIONS
        </div>
      </div>
      <div
        v-for='address in addresses'
        :key='address'
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
          <span>{{ address }}</span>
          <q-icon
            name='content_copy'
            size='16px'
            color='grey'
            :style='{
              margin: "10px 8px"
            }'
            class='cursor-pointer'
            @click='onCopyAddressClick(address)'
          />
        </div>
        <div
          :style='{
            width: "200px",
            color: "#555555"
          }'
        >
          {{ _wallet.accountBalance(address, undefined).toFixed(6) }} <strong>TLINERA</strong>
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
            label='Switch'
            @click='onSwitchClick(address)'
            class='text-blue-6'
          />
          <q-btn
            dense
            rounded
            flat
            label='Export'
            @click='onExportClick(address)'
            class='text-blue-6'
          />
          <q-btn
            dense
            rounded
            flat
            label='Delete'
            @click='onDeleteClick(address)'
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

const _wallet = wallet.useWalletStore()
const addresses = computed(() => _wallet.publicKeys)

const notification = notify.useNotificationStore()

const onSwitchClick = (address: string) => {
  _wallet.selectAddress(address)
}

const onExportClick = (chainId: string) => {
  console.log(chainId)
}

const onCopyAddressClick = (address: string) => {
  copyToClipboard(address)
    .then(() => {
      notification.pushNotification({
        Title: 'Copy Address',
        Message: `Success copy address ${address} to clipboard.`,
        Popup: true,
        Type: notify.NotifyType.Info
      })
    })
    .catch((e) => {
      console.log('Fail copy address', e)
    })
}

const onDeleteClick = (address: string) => {
  _wallet.deleteAddress(address)
}

</script>
