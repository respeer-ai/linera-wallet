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
        :loading='updatingAMSApplication'
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

const editingAMSApplication = ref(false)
const updatingAMSApplication = ref(false)

const amsApplication = computed(() => nameApplications.value.find((el) => el.applicationType === db.ApplicationType.AMS))
const amsApplicationId = ref(amsApplication.value?.applicationId)

watch(amsApplication, () => {
  amsApplicationId.value = amsApplication.value?.applicationId
})

const namedApplicationBridge = ref<InstanceType<typeof NamedApplicationBridge>>()

const onSaveAMSApplicationId = async () => {
  if (!amsApplicationId.value?.length) return
  editingAMSApplication.value = false
  updatingAMSApplication.value = true

  try {
    const creationChain = await lineraWasm.application_creation_chain_id(amsApplicationId.value)
    const microchains = await dbWallet.microchains.toArray()

    for (const microchain of microchains) {
      try {
        const operationId = await rpcBridge.Operation.requestApplication(microchain.microchain, amsApplicationId.value, db.ApplicationType.AMS)
        if (operationId) {
          await rpcBridge.Operation.waitOperation(operationId)
        }
        await rpcBridge.AMSApplicationOperation.subscribeCreationChain(microchain.microchain)
      } catch (e) {
        console.log('Faled save ams application', e)
      }
    }

    await dbBridge.NamedApplication.update({
      ...amsApplication.value,
      applicationId: amsApplicationId.value,
      creatorChain: creationChain
    } as db.NamedApplication)

    updatingAMSApplication.value = false
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Failed update ams application: ${error}`)
    updatingAMSApplication.value = false
  }
}

const onRefresh = async () => {
  if (!amsApplicationId.value?.length) return
  updatingAMSApplication.value = true

  try {
    const microchains = await dbWallet.microchains.toArray()

    for (const microchain of microchains) {
      try {
        const operationId = await rpcBridge.Operation.requestApplication(microchain.microchain, amsApplicationId.value, db.ApplicationType.AMS)
        if (operationId) {
          await rpcBridge.Operation.waitOperation(operationId)
        }
        await rpcBridge.AMSApplicationOperation.subscribeCreationChain(microchain.microchain)
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

    updatingAMSApplication.value = false
  } catch (e) {
    localStore.notification.pushNotification({
      Title: 'Refresh AMS application',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: `Failed refresh ams application: ${e}.`,
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
    updatingAMSApplication.value = false
  }
}

</script>
