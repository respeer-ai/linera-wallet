<template>
  <div :class='[ "row", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
    <div class='flex items-center justify-center'>
      <q-icon name='bi-box-seam' size='16px' />
    </div>
    <div class='label-text-small page-item-x-margin-left'>
      {{ $t('MSG_APPLICATION_MANAGEMENT_SERVICE') }}
    </div>
    <div class='word-break-all vertical-menus-margin extra-margin-bottom'>
      <div class='vertical-menus-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
        {{ $t('MSG_AMS_APPLICATION') }}
      </div>
      <div class='vertical-menus-margin text-grey-8 row flex items-center' :style='{ paddingBottom: "4px" }'>
        <div>{{ $t('MSG_APPLICATION_ID') }}</div>
        <q-space />
        <q-icon
          v-if='editingAMSApplication' name='bi-save' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='onSaveAMSApplicationId'
        />
        <q-icon
          v-else name='bi-pencil-square' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='editingAMSApplication = true'
        />
        <div class='flex items-center justify-center cursor-pointer clickable page-item-x-margin-left' @click='onRefresh'>
          <q-icon name='bi-arrow-clockwise' size='16px' />
        </div>
      </div>
      <q-input
        v-model='amsApplicationId' v-if='editingAMSApplication' autogrow hide-bottom-space
        type='textarea' :style='{marginTop: "-10px"}'
      />
      <p v-else class='vertical-items-margin text-grey-6'>
        {{ amsApplicationId }}
      </p>
      <q-btn
        flat class='btn btn-alt vertical-menus-margin full-width' label='Submit'
        no-caps @click='onSaveAMSApplicationId'
        :disable='!amsApplicationId?.length'
      />
    </div>
  </div>
  <NamedApplicationBridge ref='namedApplicationBridge' v-model:named-applications='nameApplications' />
  <RpcOperationBridge ref='rpcOperationBridge' />
  <AMSApplicationOperationBridge ref='amsApplicationOperationBridge' />
</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { localStore } from 'src/localstores'
import { db } from 'src/model'
import { dbWallet } from 'src/controller'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'

import NamedApplicationBridge from '../bridge/db/NamedApplicationBridge.vue'
import RpcOperationBridge from '../bridge/rpc/OperationBridge.vue'
import AMSApplicationOperationBridge from '../bridge/rpc/AMSApplicationOperationBridge.vue'

const rpcOperationBridge = ref<InstanceType<typeof RpcOperationBridge>>()

const nameApplications = ref([] as db.NamedApplication[])

const editingAMSApplication = ref(false)

const amsApplication = computed(() => nameApplications.value.find((el) => el.applicationType === db.ApplicationType.AMS))
const amsApplicationId = ref(amsApplication.value?.applicationId)

watch(amsApplication, () => {
  amsApplicationId.value = amsApplication.value?.applicationId
})

const namedApplicationBridge = ref<InstanceType<typeof NamedApplicationBridge>>()
const amsApplicationOperationBridge = ref<InstanceType<typeof AMSApplicationOperationBridge>>()

const onSaveAMSApplicationId = async () => {
  if (!amsApplicationId.value?.length) return
  editingAMSApplication.value = false

  try {
    const creationChain = await lineraWasm.application_creation_chain_id(amsApplicationId.value)
    const microchains = await dbWallet.microchains.toArray()

    for (const microchain of microchains) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (!await amsApplicationOperationBridge.value?.subscribeCreationChain(microchain.microchain, false)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          rpcOperationBridge.value?.requestApplication(microchain.microchain, amsApplicationId.value, creationChain, db.ApplicationType.AMS)
        }
      } catch (e) {
        console.log('Faled save ams application', e)
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await namedApplicationBridge.value?.updateNamedApplication({
      ...amsApplication.value,
      applicationId: amsApplicationId.value,
      creatorChain: creationChain
    } as db.NamedApplication)
  } catch (error) {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Failed update ams application: ${error}`)
  }
}

const onRefresh = async () => {
  if (!amsApplicationId.value?.length) return

  try {
    const creationChain = await lineraWasm.application_creation_chain_id(amsApplicationId.value)
    const microchains = await dbWallet.microchains.toArray()

    for (const microchain of microchains) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        if (!await amsApplicationOperationBridge.value?.subscribeCreationChain(microchain.microchain, true)) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          rpcOperationBridge.value?.requestApplication(microchain.microchain, amsApplicationId.value, creationChain, db.ApplicationType.AMS)
        }
      } catch (e) {
        console.log('Faled refresh ams application', e)
      }
    }

    localStore.notification.pushNotification({
      Title: 'Refresh AMS application',
      Message: 'Success refresh ams application.',
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })
  } catch (e) {
    localStore.notification.pushNotification({
      Title: 'Refresh AMS application',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: `Failed refresh ams application: ${e}.`,
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  }
}

</script>
