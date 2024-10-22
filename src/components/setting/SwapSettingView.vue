<template>
  <div :class='[ "row", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
    <div class='flex items-center justify-center'>
      <q-icon name='bi-box-seam' size='16px' />
    </div>
    <div class='label-text-small page-item-x-margin-left'>
      Swap and WTLINERA
    </div>
    <div class='word-break-all vertical-menus-margin extra-margin-bottom'>
      <div class='vertical-menus-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
        Swap application
      </div>
      <div class='vertical-menus-margin text-grey-8 row flex items-center' :style='{ paddingBottom: "4px" }'>
        <div>Application ID</div>
        <q-icon
          v-if='editingSwapApplication' name='bi-save' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='onSaveSwapApplicationId'
        />
        <q-icon
          v-else name='bi-pencil-square' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='editingSwapApplication = true'
        />
      </div>
      <q-input
        v-model='swapApplicationId' v-if='editingSwapApplication' autogrow hide-bottom-space
        type='textarea' :style='{marginTop: "-10px"}'
      />
      <p v-else class='vertical-items-margin text-grey-6'>
        {{ swapApplicationId }}
      </p>
      <div class='vertical-menus-margin text-grey-8 row flex items-center' :style='{ paddingBottom: "4px" }'>
        <div>Creation chain</div>
        <q-icon
          v-if='editingSwapCreatorChain' name='bi-save' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='onSaveSwapCreatorChain'
        />
        <q-icon
          v-else name='bi-pencil-square' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='editingSwapCreatorChain = true'
        />
      </div>
      <q-input
        v-model='swapCreatorChain' v-if='editingSwapCreatorChain' autogrow hide-bottom-space
        type='textarea' :style='{marginTop: "-10px"}'
      />
      <p v-else class='vertical-items-margin text-grey-6'>
        {{ swapCreatorChain }}
      </p>
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
    </div>
  </div>
  <NamedApplicationBridge ref='namedApplicationBridge' v-model:named-applications='nameApplications' />
</template>

<script setup lang='ts'>
import { computed, ref, watch } from 'vue'
import { localStore } from 'src/localstores'
import { db } from 'src/model'

import NamedApplicationBridge from '../bridge/db/NamedApplicationBridge.vue'

const nameApplications = ref([] as db.NamedApplication[])

const editingSwapApplication = ref(false)
const editingSwapCreatorChain = ref(false)
const editingWlineraApplication = ref(false)
const editingWlineraCreatorChain = ref(false)

const swapApplication = computed(() => nameApplications.value.find((el) => el.applicationType === db.ApplicationType.SWAP))
const wlineraApplication = computed(() => nameApplications.value.find((el) => el.applicationType === db.ApplicationType.WLINERA))

const swapApplicationId = ref(swapApplication.value?.applicationId)
const swapCreatorChain = ref(swapApplication.value?.creatorChain)
const wlineraApplicationId = ref(wlineraApplication.value?.applicationId)
const wlineraCreatorChain = ref(wlineraApplication.value?.creatorChain)

watch(swapApplication, () => {
  swapApplicationId.value = swapApplication.value?.applicationId
  swapCreatorChain.value = swapApplication.value?.creatorChain
})

watch(wlineraApplication, () => {
  wlineraApplicationId.value = wlineraApplication.value?.applicationId
  wlineraCreatorChain.value = wlineraApplication.value?.creatorChain
})

const namedApplicationBridge = ref<InstanceType<typeof NamedApplicationBridge>>()

const onSaveSwapApplicationId = async () => {
  if (!swapApplicationId.value?.length) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await namedApplicationBridge.value?.updateNamedApplication({
    ...swapApplication.value,
    applicationId: swapApplicationId.value
  } as db.NamedApplication)
  editingSwapApplication.value = false
}

const onSaveSwapCreatorChain = async () => {
  if (!swapApplicationId.value?.length) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await namedApplicationBridge.value?.updateNamedApplication({
    ...swapApplication.value,
    creatorChain: swapCreatorChain.value
  } as db.NamedApplication)
  editingSwapCreatorChain.value = false
}

const onSaveWlineraApplicationId = async () => {
  if (!swapApplicationId.value?.length) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await namedApplicationBridge.value?.updateNamedApplication({
    ...wlineraApplication.value,
    applicationId: wlineraApplicationId.value
  } as db.NamedApplication)
  editingWlineraApplication.value = false
}

const onSaveWlineraCreatorChain = async () => {
  if (!swapApplicationId.value?.length) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await namedApplicationBridge.value?.updateNamedApplication({
    ...wlineraApplication.value,
    creatorChain: wlineraCreatorChain.value
  } as db.NamedApplication)
  editingWlineraCreatorChain.value = false
}

</script>
