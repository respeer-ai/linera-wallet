<template>
  <div class='row justify-center'>
    <q-card
      class='setting-container'
      :style='{
        padding: "48px",
        borderRadius: "16px",
        maxWidth: "736px",
      }'
    >
      <div
        class='text-brown-10'
        :style='{
          margin: "0 0 16px 0",
          fontSize: "20px",
          opacity: 0.8,
          width: "100%",
        }'
      >
        Faucet
      </div>
      <div class='row wrap'>
        <q-select
          dense
          v-model='faucetSchema'
          :options='constant.HTTPSchemas'
          :style='{
            height: "48px",
            width: "140px",
          }'
          label='Faucet HTTP Schema'
        />
        <q-select
          dense
          v-model='faucetWSSchema'
          :options='constant.WSSchemas'
          :style='{
            height: "48px",
            width: "140px",
          }'
          label='Faucet WS Schema'
        />
        <q-input
          dense
          v-model='faucetHost'
          :style='{
            height: "48px",
            width: "280px",
          }'
          label='Faucet Host'
        />
        <q-input
          dense
          v-model='faucetPort'
          :style='{
            height: "48px",
            width: "80px",
          }'
          label='Faucet Port'
        />
      </div>
      <div :style='{ fontSize: "12px", opacity: 0.8 }'>
        {{ constant.toUrl(faucetSchema, faucetHost, faucetPort) }}
      </div>
      <div
        class='text-brown-10'
        :style='{
          margin: "16px 0 16px 0",
          fontSize: "20px",
          opacity: 0.8,
          width: "100%",
        }'
      >
        RPC
      </div>
      <div class='row'>
        <q-select
          dense
          v-model='rpcSchema'
          :options='constant.HTTPSchemas'
          :style='{
            height: "48px",
            width: "140px",
          }'
          label='RPC HTTP Schema'
        />
        <q-select
          dense
          v-model='rpcWSSchema'
          :options='constant.WSSchemas'
          :style='{
            height: "48px",
            width: "140px",
          }'
          label='RPC WS Schema'
        />
        <q-input
          dense
          v-model='rpcHost'
          :style='{
            height: "48px",
            width: "280px",
          }'
          label='RPC Host'
        />
        <q-input
          dense
          v-model='rpcPort'
          :style='{
            height: "48px",
            width: "80px",
          }'
          label='RPC Port'
        />
      </div>
      <div :style='{ fontSize: "12px", opacity: 0.8 }'>
        {{ constant.toUrl(rpcSchema, rpcHost, rpcPort) }}
      </div>
      <q-btn
        rounded
        label='Save'
        class='text-brown-10 bg-red-1'
        :style='{
          margin: "24px 0",
          width: "100%",
        }'
        @click='onSaveClick'
      />
      <q-separator />
      <div :style='{ margin: "32px 0 0 0" }'>
        <OpenChain />
      </div>
      <div :style='{ margin: "8px 0" }'>
        <CreateAccount />
      </div>
      <div :style='{ margin: "16px 0" }'>
        <ExportAccounts />
      </div>
      <div :style='{ margin: "32px 0 0 0" }'>
        <ClearAccounts />
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { persistentsetting, notify } from 'src/localstores'
import { endpoint } from 'src/utils'
import * as constant from 'src/const'

import CreateAccount from 'src/components/CreateAccount.vue'
import OpenChain from 'src/components/OpenChain.vue'
import ClearAccounts from 'src/components/ClearAccounts.vue'
import ExportAccounts from 'src/components/ExportAccounts.vue'

const _setting = persistentsetting.useSettingStore()

const faucetSchema = ref(endpoint.faucetSchema)
const faucetWSSchema = ref(endpoint.faucetWsSchema)
const faucetHost = ref(endpoint.faucetHost)
const faucetPort = ref(endpoint.faucetPort)

const rpcSchema = ref(endpoint.rpcSchema)
const rpcWSSchema = ref(endpoint.rpcWsSchema)
const rpcHost = ref(endpoint.rpcHost)
const rpcPort = ref(endpoint.rpcPort)

const notification = notify.useNotificationStore()

const onSaveClick = () => {
  _setting.setFaucet(
    faucetSchema.value,
    faucetWSSchema.value,
    faucetHost.value,
    faucetPort.value
  )
  _setting.setRPC(
    rpcSchema.value,
    rpcWSSchema.value,
    rpcHost.value,
    rpcPort.value
  )
  notification.pushNotification({
    Title: 'Save Setting',
    Message: 'Success save setting.',
    Popup: true,
    Type: notify.NotifyType.Info
  })
}
</script>
<style scoped lang="sass">
.setting-container
  max-width: 736px
  @media (max-width: $breakpoint-sm-max)
    width: 100%
</style>
