<template>
  <div class='page-x-padding'>
    <div>
      You can import ERC20 compatible tokens then send and receive them with CheCko. It doesn't mean that you can transfer your Linera ERC20
      compatible tokens to Ethereum blockchain or EVM compatible chain. It just means that the imported application has same interface definition
      as ERC20 spec. It you need to transfer assets to other blockchains, you still need a bridge between Linera and your target blockchain.
    </div>
    <div class='text-bold vertical-sections-margin'>
      Application ID
    </div>
    <q-input
      outlined v-model='applicationId' type='textarea' :error='applicationIdError'
      autogrow hide-bottom-space class='vertical-items-margin'
    />
    <div class='text-bold vertical-menus-margin'>
      Creation Microchain ID
    </div>
    <q-input
      outlined v-model='creationChainId' type='textarea' :error='creationChainIdError'
      autogrow hide-bottom-space class='vertical-items-margin'
    />
    <q-toggle
      v-if='false' dense v-model='importToAllChains' label='Import to all microchains'
      class='vertical-menus-margin'
    />
    <div class='vertical-sections-margin tip warn-bg warn row'>
      <q-icon name='bi-exclamation-triangle-fill' color='red-8' size='24px' />
      <div class='tip-text page-item-x-margin-left'>
        You should confirm you import the right application with its creation microchain. You may lose your assets if you interact with malfunction application.
      </div>
    </div>
    <q-btn
      class='btn vertical-sections-margin full-width' flat no-caps
      @click='onImportClick' :disabled='!canImport'
    >
      Import
    </q-btn>
    <q-btn
      class='btn btn-alt vertical-items-margin extra-margin-bottom full-width' flat no-caps
      @click='onCancelClick'
    >
      Cancel
    </q-btn>
  </div>
  <RpcOperationBridge ref='rpcOperationBridge' />
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'
import { dbWallet } from 'src/controller'
import { db } from 'src/model'

import RpcOperationBridge from '../bridge/rpc/OperationBridge.vue'

const applicationId = ref('')
const creationChainId = ref('')
const applicationIdError = ref(false)
const creationChainIdError = ref(false)
const importToAllChains = ref(false)

const canImport = computed(() => {
  return applicationId.value.length > 0 && creationChainId.value.length > 0
})

const rpcOperationBridge = ref<InstanceType<typeof RpcOperationBridge>>()

const emit = defineEmits<{(ev: 'imported'): void,
  (ev: 'error'): void,
  (ev: 'canceled'): void
}>()

const onImportClick = async () => {
  applicationIdError.value = applicationId.value.length === 0
  creationChainIdError.value = creationChainId.value.length === 0
  if (applicationIdError.value || creationChainIdError.value) return

  const microchains = await dbWallet.microchains.toArray()

  for (const microchain of microchains) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await rpcOperationBridge.value?.requestApplication(microchain.microchain, applicationId.value, creationChainId.value, db.ApplicationType.ERC20)
  }

  emit('imported')
}

const onCancelClick = () => {
  emit('canceled')
}

</script>
