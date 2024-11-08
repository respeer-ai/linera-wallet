<template>
  <div :class='[ localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
    <div class='row'>
      <div class='flex items-center justify-center'>
        <q-icon name='bi-box-seam' size='16px' />
      </div>
      <div class='label-text-small page-item-x-margin-left'>
        WTLINERA application and creation chain
      </div>
      <q-space />
      <div class='flex items-center justify-center cursor-pointer clickable' @click='onRefresh'>
        <q-icon name='bi-arrow-clockwise' size='16px' />
      </div>
    </div>
    <div class='word-break-all vertical-menus-margin extra-margin-bottom'>
      <div class='vertical-sections-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
        WTLINERA application
      </div>
      <div class='vertical-menus-margin text-grey-8 row flex items-center' :style='{ paddingBottom: "4px" }'>
        <div>Application ID</div>
        <q-icon
          v-if='editingWlineraApplication' name='bi-save' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='onSaveWlineraApplicationId'
        />
        <q-icon
          v-else name='bi-pencil-square' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='editingWlineraApplication = true'
        />
      </div>
      <q-input
        v-model='wlineraApplicationId' v-if='editingWlineraApplication' autogrow hide-bottom-space
        type='textarea' :style='{marginTop: "-10px"}'
      />
      <p v-else class='vertical-items-margin text-grey-6'>
        {{ wlineraApplicationId }}
      </p>
      <div class='vertical-menus-margin text-grey-8 row flex items-center' :style='{ paddingBottom: "4px" }'>
        <div>Creation chain</div>
        <q-icon
          v-if='editingWlineraCreatorChain' name='bi-save' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='onSaveWlineraCreatorChain'
        />
        <q-icon
          v-else name='bi-pencil-square' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='editingWlineraCreatorChain = true'
        />
      </div>
      <q-input
        v-model='wlineraCreatorChain' v-if='editingWlineraCreatorChain' autogrow hide-bottom-space
        type='textarea' :style='{marginTop: "-10px"}'
      />
      <p v-else class='vertical-items-margin text-grey-6'>
        {{ wlineraCreatorChain }}
      </p>
      <q-btn
        flat class='btn btn-alt vertical-menus-margin full-width' label='Submit'
        no-caps @click='onSubmit'
        :disable='!wlineraApplicationId?.length || !wlineraCreatorChain?.length'
      />
    </div>
  </div>
  <NamedApplicationBridge ref='namedApplicationBridge' v-model:named-applications='nameApplications' />
  <RpcOperationBridge ref='rpcOperationBridge' />
  <ERC20ApplicationOperationBridge ref='erc20ApplicationOperationBridge' />
</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { localStore } from 'src/localstores'
import { db } from 'src/model'
import { dbWallet } from 'src/controller'

import NamedApplicationBridge from '../bridge/db/NamedApplicationBridge.vue'
import RpcOperationBridge from '../bridge/rpc/OperationBridge.vue'
import ERC20ApplicationOperationBridge from '../bridge/rpc/ERC20ApplicationOperationBridge.vue'

const rpcOperationBridge = ref<InstanceType<typeof RpcOperationBridge>>()
const erc20ApplicationOperationBridge = ref<InstanceType<typeof ERC20ApplicationOperationBridge>>()

const nameApplications = ref([] as db.NamedApplication[])

const editingWlineraApplication = ref(false)
const editingWlineraCreatorChain = ref(false)

const wlineraApplication = computed(() => nameApplications.value.find((el) => el.applicationType === db.ApplicationType.WLINERA))

const wlineraApplicationId = ref(wlineraApplication.value?.applicationId)
const wlineraCreatorChain = ref(wlineraApplication.value?.creatorChain)

watch(wlineraApplication, () => {
  wlineraApplicationId.value = wlineraApplication.value?.applicationId
  wlineraCreatorChain.value = wlineraApplication.value?.creatorChain
})

const namedApplicationBridge = ref<InstanceType<typeof NamedApplicationBridge>>()

const onSaveWlineraApplicationId = () => {
  if (!wlineraApplicationId.value?.length) return
  editingWlineraApplication.value = false
}

const onSaveWlineraCreatorChain = () => {
  if (!wlineraCreatorChain.value?.length) return
  editingWlineraCreatorChain.value = false
}

const onSubmit = async () => {
  if (!wlineraApplicationId.value?.length || !wlineraCreatorChain.value?.length) return

  const microchains = await dbWallet.microchains.toArray()

  for (const microchain of microchains) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    rpcOperationBridge.value?.requestApplication(microchain.microchain, wlineraApplicationId.value, wlineraCreatorChain.value, db.ApplicationType.WLINERA)
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await namedApplicationBridge.value?.updateNamedApplication({
    ...wlineraApplication.value,
    creatorChain: wlineraCreatorChain.value,
    applicationId: wlineraApplicationId.value
  } as db.NamedApplication)
}

const onRefresh = async () => {
  if (!wlineraApplicationId.value?.length || !wlineraCreatorChain.value?.length) return

  const microchains = await dbWallet.microchains.toArray()

  for (const microchain of microchains) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    if (!await erc20ApplicationOperationBridge.value?.subscribeWLineraCreationChain(microchain.microchain, true)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      rpcOperationBridge.value?.requestApplication(microchain.microchain, wlineraApplicationId.value, wlineraCreatorChain.value, db.ApplicationType.WLINERA)
    }
  }
}

</script>
