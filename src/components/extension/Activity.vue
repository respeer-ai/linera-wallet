<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :style='{ width: "100%" }'>
    <div
      v-for='(activity, i) in activities'
      :key='i'
      class='cursor-pointer hover list-expand'
      :style='{
        paddingTop: "8px",
        paddingBottom: "8px",
        fontSize: "16px"
      }'
    >
      <div class='row text-grey-7'>
        <q-avatar
          class='bg-red-1' :icon='activityIcon(activity)' text-color='brown-6' size='36px'
          :style='{marginRight: "8px"}'
        />
        <div>
          <div :style='{fontSize: "12px"}'>
            Certificate Hash
          </div>
          <div class='row'>
            <span class='text-bold'>{{ shortid.shortId(activity.certificateHash, 8) }}</span>
            <q-icon
              name='content_copy'
              size='16px'
              color='grey'
              :style='{
                margin: "2px 8px"
              }'
              class='cursor-pointer'
              @click='onCopyClick(activity.certificateHash)'
            />
          </div>
          <div :style='{fontSize: "12px"}' class='text-grey-6'>
            {{ new Date(activity.timestamp / 1000).toLocaleDateString() }} {{ new Date(activity.timestamp / 1000).toLocaleTimeString() }}
          </div>
        </div>
        <q-space />
        <div :style='{marginLeft: "4px"}' class='text-brown-8'>
          <strong>{{ Number(activity.amount).toFixed(4) }}</strong>
          <div :style='{fontSize: "12px"}' class='text-grey-6'>
            {{ activitySign(activity) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed } from 'vue'
import { wallet, notify } from 'src/localstores'
import { shortid } from 'src/utils'
import { copyToClipboard } from 'quasar'

const _wallet = wallet.useWalletStore()
const activities = computed(() => _wallet.currentAccountActivities)

const notification = notify.useNotificationStore()

const activitySign = (activity: wallet.Activity) => {
  if (_wallet.moveBetweenChain(activity)) return 'Move'
  if (_wallet.receivedByAccount(activity)) return 'Received'
  if (_wallet.sendFromAccount(activity)) return 'Sent'
}

const activityIcon = (activity: wallet.Activity) => {
  if (_wallet.moveBetweenChain(activity)) return 'balance'
  if (_wallet.receivedByAccount(activity)) return 'input'
  if (_wallet.sendFromAccount(activity)) return 'output'
}

const onCopyClick = (address: string) => {
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

</script>
