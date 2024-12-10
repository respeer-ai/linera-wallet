<template>
  <div :class='[ localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
    <div class='row'>
      <div class='flex items-center justify-center'>
        <q-icon name='bi-box-seam' size='16px' />
      </div>
      <div class='label-text-small page-item-x-margin-left'>
        {{ $t('MSG_WLINERA_APPLICATION') }}
      </div>
    </div>
    <div class='word-break-all vertical-menus-margin extra-margin-bottom'>
      <div class='vertical-sections-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
        {{ $t('MSG_WLINERA_APPLICATION') }}
      </div>
      <div class='vertical-menus-margin text-grey-8 row flex items-center' :style='{ paddingBottom: "4px" }'>
        <div>{{ $t('MSG_APPLICATION_ID') }}</div>
        <q-space />
        <q-icon
          v-if='editingWlineraApplication' name='bi-save' size='16px' class='page-item-x-margin-left cursor-pointer clickable'
          @click='onSaveWlineraApplicationId'
        />
        <q-icon
          v-else name='bi-pencil-square' size='16px' class='page-item-x-margin-left cursor-pointer clickable'
          @click='editingWlineraApplication = true'
        />
        <div class='flex items-center justify-center cursor-pointer clickable page-item-x-margin-left' @click='onRefresh'>
          <q-icon name='bi-arrow-clockwise' size='16px' />
        </div>
      </div>
      <q-input
        v-model='wlineraApplicationId' v-if='editingWlineraApplication' autogrow hide-bottom-space
        type='textarea' :style='{marginTop: "-10px"}'
      />
      <p v-else class='vertical-items-margin text-grey-6'>
        {{ wlineraApplicationId }}
      </p>
      <q-btn
        flat class='btn btn-alt vertical-menus-margin full-width' label='Save'
        no-caps @click='onSaveWlineraApplicationId'
        :disable='!wlineraApplicationId?.length'
        :loading='updatingWlineraApplication'
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

const editingWlineraApplication = ref(false)
const updatingWlineraApplication = ref(false)

const wlineraApplication = computed(() => nameApplications.value.find((el) => el.applicationType === db.ApplicationType.WLINERA))
const wlineraApplicationId = ref(wlineraApplication.value?.applicationId)

watch(wlineraApplication, () => {
  wlineraApplicationId.value = wlineraApplication.value?.applicationId
})

const namedApplicationBridge = ref<InstanceType<typeof NamedApplicationBridge>>()

const onSaveWlineraApplicationId = async () => {
  if (!wlineraApplicationId.value?.length) return
  editingWlineraApplication.value = false
  updatingWlineraApplication.value = true

  try {
    const creationChain = await lineraWasm.application_creation_chain_id(wlineraApplicationId.value)
    const microchains = await dbWallet.microchains.toArray()

    await dbBridge.NamedApplication.update({
      ...wlineraApplication.value,
      creatorChain: creationChain,
      applicationId: wlineraApplicationId.value
    } as db.NamedApplication)

    for (const microchain of microchains) {
      try {
        await rpcBridge.ERC20ApplicationOperation.persistApplication(microchain.microchain, wlineraApplicationId.value, db.ApplicationType.WLINERA)
      } catch (e) {
        console.log('Failed save swap application', e)
      }
    }

    updatingWlineraApplication.value = false
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Failed update wlinera application: ${error}`)
    updatingWlineraApplication.value = false
  }
}

const onRefresh = async () => {
  if (!wlineraApplicationId.value?.length) return
  updatingWlineraApplication.value = true

  try {
    const microchains = await dbWallet.microchains.toArray()

    for (const microchain of microchains) {
      try {
        await rpcBridge.ERC20ApplicationOperation.persistApplication(microchain.microchain, wlineraApplicationId.value, db.ApplicationType.WLINERA)
      } catch (e) {
        console.log('Failed refresh wlinera application', e, microchain.microchain)
      }
    }

    localStore.notification.pushNotification({
      Title: 'Refresh WLinera application',
      Message: 'Success refresh wlinera application.',
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })

    updatingWlineraApplication.value = false
  } catch (e) {
    localStore.notification.pushNotification({
      Title: 'Refresh WLinera application',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: `Failed refresh wlinera application: ${e}.`,
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
    updatingWlineraApplication.value = false
  }
}

</script>
