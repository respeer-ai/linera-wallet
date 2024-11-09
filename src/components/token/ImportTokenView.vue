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
    <div class='vertical-sections-margin tip warn-bg warn row'>
      <q-icon name='bi-exclamation-triangle-fill' color='red-8' size='24px' />
      <div class='tip-text page-item-x-margin-left'>
        You should confirm you import the right application. You may lose your assets if you interact with malfunction application.
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
  <ERC20ApplicationOperationBridge ref='erc20ApplicationOperationBridge' />
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'
import { dbWallet } from 'src/controller'
import { db } from 'src/model'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'

import RpcOperationBridge from '../bridge/rpc/OperationBridge.vue'
import ERC20ApplicationOperationBridge from '../bridge/rpc/ERC20ApplicationOperationBridge.vue'

const applicationId = ref('')
const applicationIdError = ref(false)

const canImport = computed(() => {
  return applicationId.value.length > 0
})

const rpcOperationBridge = ref<InstanceType<typeof RpcOperationBridge>>()
const erc20ApplicationOperationBridge = ref<InstanceType<typeof ERC20ApplicationOperationBridge>>()

const emit = defineEmits<{(ev: 'imported'): void,
  (ev: 'error'): void,
  (ev: 'canceled'): void
}>()

const onImportClick = async () => {
  applicationIdError.value = applicationId.value.length === 0
  if (applicationIdError.value) return

  try {
    const creationChain = await lineraWasm.application_creation_chain_id(applicationId.value)
    const microchains = await dbWallet.microchains.toArray()

    for (const microchain of microchains) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      if (!await erc20ApplicationOperationBridge.value?.subscribeCreationChain(microchain.microchain, applicationId.value, false)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        rpcOperationBridge.value?.requestApplication(microchain.microchain, applicationId.value, creationChain, db.ApplicationType.WLINERA)
      }
    }

    emit('imported')
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Failed refresh erc20 application: ${error}`)
    emit('error')
  }
}

const onCancelClick = () => {
  emit('canceled')
}

</script>
