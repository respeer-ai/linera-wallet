<template>
  <div class='full-width'>
    <div class='text-bold'>
      Network name
    </div>
    <div class='page-item-y-margin-top'>
      <q-input dense outlined v-model='network.name' :disable='network.preset' />
    </div>
    <div class='text-bold page-item-y-margin-top'>
      Faucet URL
    </div>
    <div class='page-item-y-margin-top'>
      <q-input dense outlined v-model='network.faucetUrl' :disable='network.preset' />
    </div>
    <div class='text-bold page-item-y-margin-top'>
      RPC URL
    </div>
    <div class='page-item-y-margin-top'>
      <q-input dense outlined v-model='rpcUrl' :disable='network.preset' />
    </div>
    <div class='vertical-sections-margin'>
      <q-btn
        dense flat class='btn full-width' no-caps
        @click='onSaveClick'
        v-if='!network.preset'
      >
        Save
      </q-btn>
      <q-btn
        dense flat class='btn btn-alt full-width vertical-items-margin' no-caps
        @click='onDeleteClick'
        v-if='!network.preset && network.id !== undefined'
      >
        Delete
      </q-btn>
    </div>
    <NetworkBridge ref='networkBridge' />
  </div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, ref, watch } from 'vue'

import NetworkBridge from '../bridge/db/NetworkBridge.vue'

const network = defineModel<db.Network>({ default: {} as db.Network })

const rpcUrl = computed({
  get: () => network.value ? db.rpcUrl(network.value) : '',
  set: (val: string) => {
    const v = new URL(val)
    network.value = {
      ...network.value,
      rpcSchema: v.protocol.replace(':', ''),
      host: v.hostname,
      port: parseInt(v.port),
      path: v.pathname
    } as db.Network
  }
})

watch([network.value.name, network.value.faucetUrl, rpcUrl.value], () => {
  network.value = {
    ...network.value
  } as db.Network
})

const emit = defineEmits<{(ev: 'saved', value: db.Network): void,
  (ev: 'deleted', value: db.Network): void
}>()

const networkBridge = ref<InstanceType<typeof NetworkBridge>>()

const onSaveClick = async () => {
  network.value.id === undefined
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    ? await networkBridge.value?.createNetwork({ ...network.value })
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    : await networkBridge.value?.updateNetwork({ ...network.value })
  emit('saved', network.value)
}

const onDeleteClick = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await (networkBridge.value)?.deleteNetwork(network.value.id as number)
  emit('deleted', network.value)
}

</script>
