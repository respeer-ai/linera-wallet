<template>
  <div :class='[ localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
    <div class='row'>
      <div class='flex items-center justify-center'>
        <q-icon name='bi-box-seam' size='16px' />
      </div>
      <div class='label-text-small page-item-x-margin-left'>
        {{ $t('MSG_SWAP_APPLICATION') }}
      </div>
    </div>
    <div class='word-break-all vertical-menus-margin extra-margin-bottom'>
      <div class='vertical-menus-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
        {{ $t('MSG_SWAP_APPLICATION') }}
      </div>
      <div class='vertical-menus-margin text-grey-8 row flex items-center' :style='{ paddingBottom: "4px" }'>
        <div>{{ $t('MSG_APPLICATION_ID') }}</div>
        <q-space />
        <q-icon
          v-if='editingSwapApplication' name='bi-save' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='onSaveSwapApplicationId'
        />
        <q-icon
          v-else name='bi-pencil-square' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='editingSwapApplication = true'
        />
        <div class='flex items-center justify-center cursor-pointer clickable page-item-x-margin-left' @click='onRefresh'>
          <q-icon name='bi-arrow-clockwise' size='16px' />
        </div>
      </div>
      <q-input
        v-model='swapApplicationId' v-if='editingSwapApplication' autogrow hide-bottom-space
        type='textarea' :style='{marginTop: "-10px"}'
      />
      <p v-else class='vertical-items-margin text-grey-6'>
        {{ swapApplicationId }}
      </p>
      <q-btn
        flat class='btn btn-alt vertical-menus-margin full-width' label='Submit'
        no-caps @click='onSaveSwapApplicationId'
        :disable='!swapApplicationId?.length'
        :loading='updatingSwapApplication'
      />
    </div>
  </div>
  <NamedApplicationBridge ref='namedApplicationBridge' v-model:named-applications='nameApplications' />
</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { localStore } from 'src/localstores'
import { db } from 'src/model'
import { dbWallet } from 'src/controller'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { dbBridge, rpcBridge } from 'src/bridge'

import NamedApplicationBridge from '../bridge/db/NamedApplicationBridge.vue'

const nameApplications = ref([] as db.NamedApplication[])

const editingSwapApplication = ref(false)
const updatingSwapApplication = ref(false)

const swapApplication = computed(() => nameApplications.value.find((el) => el.applicationType === db.ApplicationType.SWAP))
const swapApplicationId = ref(swapApplication.value?.applicationId)

watch(swapApplication, () => {
  swapApplicationId.value = swapApplication.value?.applicationId
})

const onSaveSwapApplicationId = async () => {
  if (!swapApplicationId.value?.length) return
  editingSwapApplication.value = false
  updatingSwapApplication.value = true

  try {
    const creationChain = await lineraWasm.application_creation_chain_id(swapApplicationId.value)
    const microchains = await dbWallet.microchains.toArray()

    for (const microchain of microchains) {
      try {
        const operationId = await rpcBridge.Operation.requestApplication(microchain.microchain, swapApplicationId.value, db.ApplicationType.SWAP)
        if (operationId) {
          await rpcBridge.Operation.waitOperation(operationId)
        }
        await rpcBridge.SwapApplicationOperation.subscribeCreationChain(microchain.microchain)
      } catch (e) {
        console.log('Faled refresh swap application', e)
      }
    }

    await dbBridge.NamedApplication.update({
      ...swapApplication.value,
      applicationId: swapApplicationId.value,
      creatorChain: creationChain
    } as db.NamedApplication)

    updatingSwapApplication.value = false
  } catch (error) {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Failed update swap application: ${error}`)
    updatingSwapApplication.value = false
  }
}

const onRefresh = async () => {
  if (!swapApplicationId.value?.length) return
  updatingSwapApplication.value = true

  try {
    const microchains = await dbWallet.microchains.toArray()

    for (const microchain of microchains) {
      try {
        const operationId = await rpcBridge.Operation.requestApplication(microchain.microchain, swapApplicationId.value, db.ApplicationType.SWAP)
        if (operationId) {
          await rpcBridge.Operation.waitOperation(operationId)
        }
        await rpcBridge.SwapApplicationOperation.subscribeCreationChain(microchain.microchain)
      } catch (e) {
        console.log('Faled refresh swap application', e)
      }
    }

    localStore.notification.pushNotification({
      Title: 'Refresh Swap application',
      Message: 'Success refresh swap application.',
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })

    updatingSwapApplication.value = false
  } catch (e) {
    localStore.notification.pushNotification({
      Title: 'Refresh Swap application',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: `Failed refresh swap application: ${e}.`,
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
    updatingSwapApplication.value = false
  }
}

</script>
