<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div v-if='microchains.length > 0'>
      <MicrochainCardView v-for='microchain in microchains' :key='microchain.microchain' :microchain='microchain' />
    </div>
    <div v-else class='page-item-placeholder'>
      <div class='cursor-pointer' @click='onCreateMicrochainClick'>
        <q-icon name='bi-plus-circle' size='48px' color='grey-4' />
      </div>
      <div class='page-item-y-margin-top'>
        No usable microchain?
        <span class='cursor-pointer like-link' @click='onCreateMicrochainClick'>Create</span> or
        <span class='cursor-pointer like-link' @click='onImportMicrochainClick'>Import</span>.
      </div>
    </div>
    <q-space />
  </div>
  <DbMicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
  <DbMicrochainBridge v-model:microchains='microchains' />
  <OpenChain ref='openChain' />
  <q-dialog v-model='creatingMicrochain'>
    <q-card>{{ createdMicrochain }}</q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from 'src/model'
import { localStore } from 'src/localstores'

import DbMicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import MicrochainCardView from './MicrochainCardView.vue'
import OpenChain from './OpenChain.vue'

const microchainOwners = ref([] as db.MicrochainOwner[])
const microchains = ref([] as db.Microchain[])
const createdMicrochain = ref(undefined as unknown as db.Microchain)

const creatingMicrochain = ref(false)
const openChain = ref<InstanceType<typeof OpenChain>>()

const onCreateMicrochainClick = () => {
  creatingMicrochain.value = true
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  openChain.value?.openMicrochain().then((microchain: db.Microchain) => {
    createdMicrochain.value = microchain
    localStore.notification.pushNotification({
      Title: 'Open chain',
      Message: 'Success open microchain.',
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })
  }).catch((error) => {
    localStore.notification.pushNotification({
      Title: 'Open chain',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: `Failed open microchain: ${error}.`,
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  })
}

const onImportMicrochainClick = () => {
  // TODO
}

</script>
