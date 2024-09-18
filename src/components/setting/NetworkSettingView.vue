<template>
  <div
    class='text-brown-10'
    :style='{
      margin: "0 0 16px 0",
      fontSize: "20px",
      opacity: 0.8,
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
        width: "80px",
      }'
      label='Faucet HTTP Schema'
    />
    <q-select
      dense
      v-model='faucetWSSchema'
      :options='constant.WSSchemas'
      :style='{
        height: "48px",
        width: "80px",
      }'
      label='Faucet WS Schema'
    />
    <q-input
      dense
      v-model='faucetHost'
      :style='{
        height: "48px",
        width: "200px",
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
        width: "80px",
      }'
      label='RPC HTTP Schema'
    />
    <q-select
      dense
      v-model='rpcWSSchema'
      :options='constant.WSSchemas'
      :style='{
        height: "48px",
        width: "80px",
      }'
      label='RPC WS Schema'
    />
    <q-input
      dense
      v-model='rpcHost'
      :style='{
        height: "48px",
        width: "200px",
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
      margin: "24px 0"
    }'
    @click='onSaveClick'
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { localStore } from 'src/localstores'
import { endpoint } from 'src/utils'
import * as constant from 'src/const'

const faucetSchema = ref(endpoint.faucetSchema)
const faucetWSSchema = ref(endpoint.faucetWsSchema)
const faucetHost = ref(endpoint.faucetPublicHost)
const faucetPort = ref(endpoint.faucetPort)

const rpcSchema = ref(endpoint.rpcSchema)
const rpcWSSchema = ref(endpoint.rpcWsSchema)
const rpcHost = ref(endpoint.rpcHost)
const rpcPort = ref(endpoint.rpcPort)

const onSaveClick = () => {
  localStore.persistentSetting.setFaucet(
    faucetSchema.value,
    faucetWSSchema.value,
    faucetHost.value,
    faucetPort.value
  )
  localStore.persistentSetting.setRPC(
    rpcSchema.value,
    rpcWSSchema.value,
    rpcHost.value,
    rpcPort.value
  )
  localStore.notification.pushNotification({
    Title: 'Save Setting',
    Message: 'Success save setting.',
    Popup: true,
    Type: localStore.notify.NotifyType.Info
  })
}
</script>
