<template>
  <div :class='[ "row", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
    <div class='flex items-center justify-center'>
      <q-icon name='bi-box-seam' size='16px' />
    </div>
    <div class='label-text-small page-item-x-margin-left'>
      Swap and WTLINERA
    </div>
    <div class='word-break-all vertical-menus-margin'>
      <div class='vertical-menus-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
        <div>Swap application</div>
        <q-icon
          v-if='editingSwapApplication' name='bi-save' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='onSaveSwapApplication'
        />
        <q-icon
          v-else name='bi-pencil-square' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='editingSwapApplication = true'
        />
      </div>
      <q-input
        v-model='swapApplicationId' v-if='editingSwapApplication' autogrow hide-bottom-space
        type='textarea'
      />
      <p v-else class='vertical-menus-margin text-grey-8'>
        {{ swapApplicationId }}
      </p>
      <div class='vertical-menus-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
        <div>WTLINERA application</div>
        <q-icon
          v-if='editingWlineraApplication' name='bi-save' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='onSaveSWlineraApplication'
        />
        <q-icon
          v-else name='bi-pencil-square' size='16px' class='page-item-x-margin-left cursor-pointer'
          @click='editingWlineraApplication = true'
        />
      </div>
      <q-input
        v-model='wlineraApplicationId' v-if='editingWlineraApplication' autogrow hide-bottom-space
        type='textarea'
      />
      <p v-else class='vertical-menus-margin text-grey-8'>
        {{ wlineraApplicationId }}
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
const editingWlineraApplication = ref(false)
const swapApplication = computed(() => nameApplications.value.find((el) => el.application_type === db.ApplicationType.SWAP))
const wlineraApplication = computed(() => nameApplications.value.find((el) => el.application_type === db.ApplicationType.WLINERA))
const swapApplicationId = ref(swapApplication.value?.application_id)
const wlineraApplicationId = ref(wlineraApplication.value?.application_id)

watch(swapApplication, () => {
  swapApplicationId.value = swapApplication.value?.application_id
})

watch(wlineraApplication, () => {
  wlineraApplicationId.value = wlineraApplication.value?.application_id
})

const namedApplicationBridge = ref<InstanceType<typeof NamedApplicationBridge>>()

const onSaveSwapApplication = async () => {
  if (!swapApplicationId.value?.length) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await namedApplicationBridge.value?.updateNamedApplication({
    ...swapApplication.value,
    application_id: swapApplicationId.value
  } as db.NamedApplication)
  editingSwapApplication.value = false
}

const onSaveSWlineraApplication = async () => {
  if (!swapApplicationId.value?.length) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await namedApplicationBridge.value?.updateNamedApplication({
    ...wlineraApplication.value,
    application_id: wlineraApplicationId.value
  } as db.NamedApplication)
  editingWlineraApplication.value = false
}

</script>
