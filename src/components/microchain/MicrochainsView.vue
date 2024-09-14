<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div>
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
      <div class='row vertical-sections-margin selector-margin-x-left cursor-pointer' @click='onCreateMicrochainClick'>
        <q-icon name='bi-plus-lg' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          Create microchain
        </div>
      </div>
      <div class='row vertical-items-margin selector-margin-x-left cursor-pointer' @click='onImportMicrochainClick'>
        <q-icon name='bi-plus-lg' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          Import microchain
        </div>
      </div>
      <div class='row vertical-items-margin selector-margin-x-left cursor-pointer' @click='onSynchronizeMicrochainsClick'>
        <q-icon name='bi-arrow-repeat' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          Synchronize microchains
        </div>
      </div>
    </div>
    <q-space />
  </div>
  <DbMicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
  <DbMicrochainBridge ref='dbMicrochainBridge' v-model:microchains='microchains' />
  <OwnerBridge v-model:selected-owner='selectedOwner' />
  <RpcMicrochainBridge ref='rpcMicrochainBridge' />
  <q-dialog v-model='creatingMicrochain'>
    <q-card class='dialog'>
      <h5 class='onboarding-page-title text-center page-title'>
        Create microchain
      </h5>
      <CreateMicrochainView @created='onMicrochainCreated' @error='onCreateMicrochainError' />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db, rpc } from 'src/model'
import { localStore } from 'src/localstores'

import DbMicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainCardView from './MicrochainCardView.vue'
import CreateMicrochainView from './CreateMicrochainView.vue'
import RpcMicrochainBridge from '../bridge/rpc/MicrochainBridge.vue'

const microchainOwners = ref([] as db.MicrochainOwner[])
const microchains = ref([] as db.Microchain[])
const selectedOwner = ref(undefined as unknown as db.Owner)

const creatingMicrochain = ref(false)
const rpcMicrochainBridge = ref<InstanceType<typeof RpcMicrochainBridge>>()
const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()

const onMicrochainCreated = () => {
  creatingMicrochain.value = false
}

const onCreateMicrochainError = () => {
  creatingMicrochain.value = false
}

const onCreateMicrochainClick = () => {
  creatingMicrochain.value = true
}

const onImportMicrochainClick = () => {
  // TODO
}

const onSynchronizeMicrochainsClick = () => {
  if (!selectedOwner.value) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  rpcMicrochainBridge.value?.chains(selectedOwner.value?.address).then(async (resp: rpc.ChainsResp) => {
    for (const microchain of resp.list) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await dbMicrochainBridge.value?.addMicrochain(selectedOwner.value.owner, microchain, undefined, undefined, undefined, resp.default === microchain)
    }
    localStore.notification.pushNotification({
      Title: 'Synchronize microchains',
      Message: 'Success synchronize microchains.',
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })
  }).catch((error) => {
    localStore.notification.pushNotification({
      Title: 'Synchronize microchains',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: `Failed synchronize microchains: ${error}.`,
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  })
}

</script>
