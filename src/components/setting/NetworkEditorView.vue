<template>
  <div :class='[ "full-width", localStore.setting.extensionMode ? "page-x-padding" : "" ]'>
    <div class='text-bold'>
      {{ $t('MSG_NETWORK_NAME') }}
    </div>
    <div class='page-item-y-margin-top'>
      <q-input
        autogrow dense outlined v-model='network.name'
        :disable='network.preset || network.selected'
      />
    </div>
    <div class='text-bold vertical-menus-margin'>
      {{ $t('MSG_FAUCET_URL') }}
    </div>
    <div class='page-item-y-margin-top'>
      <q-input
        autogrow dense outlined v-model='network.faucetUrl'
        :disable='network.preset || network.selected'
      />
    </div>
    <div class='text-bold vertical-menus-margin'>
      {{ $t('MSG_RPC_URL') }}
    </div>
    <div class='page-item-y-margin-top'>
      <q-input
        autogrow dense outlined v-model='rpcUrl'
        :disable='network.preset || network.selected'
      />
    </div>
    <div class='text-bold vertical-menus-margin'>
      {{ $t('MSG_SUBSCRIPTION_URL') }}
    </div>
    <div class='page-item-y-margin-top'>
      <q-input
        autogrow dense outlined v-model='wsUrl'
        :disable='network.preset || network.selected'
      />
    </div>
    <div class='vertical-sections-margin'>
      <q-btn
        flat class='btn full-width vertical-menus-margin' no-caps
        @click='onSaveClick'
        v-if='!network.preset && !network.selected'
        :disable='!network.faucetUrl || !network.host || !network.name || !network.port || !network.rpcSchema || !network.wsSchema'
      >
        {{ $t('MSG_SAVE') }}
      </q-btn>
      <q-btn
        flat class='btn btn-alt full-width vertical-items-margin' no-caps
        @click='onDeleteClick'
        v-if='!network.preset && network.id !== undefined && !network.selected'
      >
        {{ $t('MSG_DELETE') }}
      </q-btn>
    </div>
    <NetworkBridge ref='networkBridge' />
  </div>
</template>

<script setup lang='ts'>
import { dbModel } from 'src/model'
import { computed, ref, watch } from 'vue'
import { localStore } from 'src/localstores'
import { dbBridge } from 'src/bridge'

import NetworkBridge from '../bridge/db/NetworkBridge.vue'

const network = defineModel<dbModel.Network>({ default: {} as dbModel.Network })

const rpcUrl = computed({
  get: () => network.value ? dbModel.rpcUrl(network.value) : '',
  set: (val: string) => {
    const v = new URL(val)
    const protocol = v.protocol.replace(':', '')
    network.value = {
      ...network.value,
      icon: dbModel.defaultNetwork.icon,
      rpcSchema: protocol,
      wsSchema: protocol === dbModel.HTTPSchema.HTTP ? dbModel.WSSchema.WS : dbModel.WSSchema.WSS,
      host: v.hostname,
      port: parseInt(v.port),
      path: v.pathname
    } as dbModel.Network
  }
})

const wsUrl = computed({
  get: () => network.value ? dbModel.wsUrl(network.value) : '',
  set: (val: string) => {
    const v = new URL(val)
    const protocol = v.protocol.replace(':', '')
    network.value = {
      ...network.value,
      icon: dbModel.defaultNetwork.icon,
      wsSchema: protocol,
      rpcSchema: protocol === dbModel.WSSchema.WS ? dbModel.HTTPSchema.HTTP : dbModel.HTTPSchema.HTTPS,
      host: v.hostname,
      port: parseInt(v.port),
      path: v.pathname
    } as dbModel.Network
  }
})

watch([network.value.name, network.value.faucetUrl, rpcUrl.value], () => {
  network.value = {
    ...network.value
  } as dbModel.Network
})

const emit = defineEmits<{(ev: 'saved', value: dbModel.Network): void,
  (ev: 'deleted', value: dbModel.Network): void
}>()

const networkBridge = ref<InstanceType<typeof NetworkBridge>>()

const onSaveClick = async () => {
  network.value.id === undefined
    ? await dbBridge.Network.create({ ...network.value })
    : await dbBridge.Network.update({ ...network.value })
  emit('saved', network.value)
}

const onDeleteClick = async () => {
  await dbBridge.Network.delete(network.value.id as number)
  emit('deleted', network.value)
}

</script>
