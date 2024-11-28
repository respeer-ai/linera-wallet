<template>
  <div class='page-x-padding'>
    <div>
      {{ $t('MSG_CAN_IMPORT_ERC20_COMPATIBLE_TOKEN') }}
    </div>
    <div class='text-bold vertical-sections-margin'>
      {{ $t('MSG_APPLICATION_ID') }}
    </div>
    <q-input
      outlined v-model='applicationId' type='textarea' :error='applicationIdError'
      autogrow hide-bottom-space class='vertical-items-margin'
    />
    <div class='vertical-sections-margin tip warn-bg warn row'>
      <q-icon name='bi-exclamation-triangle-fill' color='red-8' size='24px' />
      <div class='tip-text page-item-x-margin-left'>
        {{ $t('MSG_SHOULD_CONFIRM_IMPORT_RIGHT_APPLICATION') }}
      </div>
    </div>
    <q-btn
      class='btn vertical-sections-margin full-width' flat no-caps
      @click='onImportClick' :disabled='!canImport'
    >
      {{ $t('MSG_IMPORT') }}
    </q-btn>
    <q-btn
      class='btn btn-alt vertical-items-margin extra-margin-bottom full-width' flat no-caps
      @click='onCancelClick'
    >
      {{ $t('MSG_CANCEL') }}
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
        rpcOperationBridge.value?.requestApplication(microchain.microchain, applicationId.value, creationChain, db.ApplicationType.ERC20)
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
