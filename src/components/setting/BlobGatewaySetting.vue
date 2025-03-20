<template>
  <div :class='[ localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
    <div class='row'>
      <div class='flex items-center justify-center'>
        <q-icon name='bi-box-seam' size='16px' />
      </div>
      <div class='label-text-small page-item-x-margin-left'>
        {{ $t('MSG_BLOB_GATEWAY_APPLICATION') }}
      </div>
    </div>
    <div class='word-break-all vertical-menus-margin extra-margin-bottom'>
      <div class='vertical-menus-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
        {{ $t('MSG_BLOB_GATEWAY_APPLICATION') }}
      </div>
      <div class='vertical-menus-margin text-grey-8 row flex items-center' :style='{ paddingBottom: "4px" }'>
        <div>{{ $t('MSG_APPLICATION_ID') }}</div>
        <q-space />
        <q-icon
          v-if='editingBlobGatewayApplication' name='bi-save' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='onSaveBlobGatewayApplicationId'
        />
        <q-icon
          v-else name='bi-pencil-square' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='editingBlobGatewayApplication = true'
        />
      </div>
      <q-input
        v-model='blobGatewayApplicationId' v-if='editingBlobGatewayApplication' autogrow hide-bottom-space
        type='textarea' :style='{marginTop: "-10px"}'
      />
      <p v-else class='vertical-items-margin text-grey-6'>
        {{ blobGatewayApplicationId }}
      </p>
      <q-btn
        flat class='btn btn-alt vertical-menus-margin full-width' label='Submit'
        no-caps @click='onSaveBlobGatewayApplicationId'
        :disable='!blobGatewayApplicationId?.length'
        :loading='updatingBlobGatewayApplication'
      />
    </div>
  </div>
  <NamedApplicationBridge ref='namedApplicationBridge' v-model:named-applications='nameApplications' />
</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { localStore } from 'src/localstores'
import { db } from 'src/model'
import { dbBridge, rpcBridge } from 'src/bridge'

import NamedApplicationBridge from '../bridge/db/NamedApplicationBridge.vue'

const nameApplications = ref([] as db.NamedApplication[])

const editingBlobGatewayApplication = ref(false)
const updatingBlobGatewayApplication = ref(false)

const blobGatewayApplication = computed(() => nameApplications.value.find((el) => el.applicationType === db.ApplicationType.BLOB_GATEWAY))
const blobGatewayApplicationId = ref(blobGatewayApplication.value?.applicationId)

watch(blobGatewayApplication, () => {
  blobGatewayApplicationId.value = blobGatewayApplication.value?.applicationId
})

const onSaveBlobGatewayApplicationId = async () => {
  if (!blobGatewayApplicationId.value?.length) return
  editingBlobGatewayApplication.value = false
  updatingBlobGatewayApplication.value = true

  try {
    const microchain = await dbBridge.Microchain.anyMicrochain()
    if (!microchain) return
    const creationChain = await rpcBridge.ApplicationCreatorChain.id(microchain.microchain, blobGatewayApplicationId.value)

    await dbBridge.NamedApplication.update({
      ...blobGatewayApplication.value,
      applicationId: blobGatewayApplicationId.value,
      creatorChain: creationChain
    } as db.NamedApplication)

    updatingBlobGatewayApplication.value = false
  } catch (error) {
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Failed update blobGateway application: ${error}`)
    updatingBlobGatewayApplication.value = false
  }
}
</script>
