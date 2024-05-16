<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class='row' :style='{marginTop: "48px"}' style='overflow-x: auto;'>
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
            width: "280px",
            fontWeight: 600
          }'
        >
          FROM
        </div>
        <div
          :style='{
            width: "240px",
            fontWeight: 600
          }'
        >
          AMOUNT / DATE / BLOCK
        </div>
        <div
          :style='{
            width: "280px",
            fontWeight: 600
          }'
        >
          TO
        </div>
        <div
          :style='{
            width: "280px",
            fontWeight: 600
          }'
        >
          TX HASH / GAS
        </div>
      </div>
      <div
        v-for='(activity, i) in activities'
        :key='i'
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
            width: "280px",
            color: "#555555"
          }'
        >
          <div v-if='activity.sourceAddress' class='row'>
            <span>{{ shortid.shortId(activity.sourceAddress, addressDisplayLength) }}</span>
            <q-icon
              name='content_copy'
              size='16px'
              color='grey'
              :style='{
                margin: "10px 8px"
              }'
              class='cursor-pointer'
              @click='onCopyClick(activity.sourceAddress)'
            />
          </div>
          <strong>{{ activity.sourceAddress ? 'On ' : '' }}Microchain</strong>
          <div class='row'>
            <span>{{ shortid.shortId(activity.sourceChain, addressDisplayLength) }}</span>
            <q-icon
              name='content_copy'
              size='16px'
              color='grey'
              :style='{
                margin: "10px 8px"
              }'
              class='cursor-pointer'
              @click='onCopyClick(activity.sourceChain)'
            />
          </div>
        </div>
        <div
          :style='{
            width: "240px",
            color: "#555555"
          }'
        >
          <div>{{ Number(activity.amount).toFixed(4) }} <strong>TLINERA</strong></div>
          <div>{{ new Date(activity.timestamp / 1000).toLocaleDateString() }} {{ new Date(activity.timestamp / 1000).toLocaleTimeString() }}</div>
          <div>Block <strong>{{ activity.blockHeight }}</strong></div>
        </div>
        <div
          :style='{
            width: "280px",
            color: "#555555"
          }'
        >
          <div v-if='activity.targetAddress' class='row'>
            <span>{{ shortid.shortId(activity.targetAddress, addressDisplayLength) }}</span>
            <q-icon
              name='content_copy'
              size='16px'
              color='grey'
              :style='{
                margin: "10px 8px"
              }'
              class='cursor-pointer'
              @click='onCopyClick(activity.targetAddress)'
            />
          </div>
          <strong>{{ activity.targetAddress ? 'On ' : '' }}Microchain</strong>
          <div class='row'>
            <span>{{ shortid.shortId(activity.targetChain, addressDisplayLength) }}</span>
            <q-icon
              name='content_copy'
              size='16px'
              color='grey'
              :style='{
                margin: "10px 8px"
              }'
              class='cursor-pointer'
              @click='onCopyClick(activity.targetChain)'
            />
          </div>
        </div>
        <div
          :style='{
            width: "280px",
            color: "#555555"
          }'
        >
          <div class='row'>
            <span>{{ shortid.shortId(activity.certificateHash, addressDisplayLength) }}</span>
            <q-icon
              name='content_copy'
              size='16px'
              color='grey'
              :style='{
                margin: "10px 8px"
              }'
              class='cursor-pointer'
              @click='onCopyClick(activity.certificateHash)'
            />
          </div>
          <div>
            {{ Number(activity.grant || 0).toFixed(4) }} <strong>TLGAS</strong>
          </div>
        </div>
      </div>
    </div>
    <q-space />
  </div>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'
import { wallet, notify } from '../localstores'
import { shortid } from '../utils'
import { copyToClipboard } from 'quasar'

const _wallet = wallet.useWalletStore()
const activities = computed(() => _wallet.currentAccountActivities)

const notification = notify.useNotificationStore()
const addressDisplayLength = ref(10)

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
