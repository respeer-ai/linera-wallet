<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div>
      <div v-if='microchains.length > 0'>
        <div v-for='microchain in displayMicrochains' :key='microchain.microchain' @click='onMicrochainClick(microchain)' class='cursor-pointer'>
          <MicrochainCardView :microchain='microchain' />
        </div>
        <q-btn
          rounded flat no-caps class='full-width bg-grey-1'
          @click='onViewMoreClick'
          v-if='displayCount < microchains.length'
          color='grey-6'
          :label='$t("MSG_VIEW_MORE_THREE_DOTS")'
        />
      </div>
      <div v-else class='page-item-placeholder'>
        <div class='cursor-pointer' @click='onCreateMicrochainClick'>
          <q-icon name='bi-plus-circle' size='48px' color='grey-4' />
        </div>
        <div class='page-item-y-margin-top'>
          {{ $t('MSG_NO_USABLE_MICROCHAIN') }}
          <span class='cursor-pointer like-link' @click='onCreateMicrochainClick'>{{ $t('MSG_CREATE') }}</span> {{ $t('MSG_OR_LOWER_CASE') }}
          <span class='cursor-pointer like-link' @click='onImportMicrochainClick'>{{ $t('MSG_IMPORT') }}</span>.
        </div>
      </div>
      <div class='row vertical-sections-margin selector-margin-x-left cursor-pointer' @click='onCreateMicrochainClick'>
        <q-icon name='bi-plus-lg' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          {{ $t('MSG_CREATE_MICROCHAIN') }}
        </div>
      </div>
      <div class='row vertical-items-margin selector-margin-x-left cursor-pointer' @click='onImportMicrochainClick'>
        <q-icon name='bi-plus-lg' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          {{ $t('MSG_IMPORT_MICROCHAIN') }}
        </div>
      </div>
      <div class='row vertical-items-margin selector-margin-x-left cursor-pointer' @click='onSynchronizeMicrochainsClick'>
        <q-icon name='bi-arrow-repeat' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          {{ $t('MSG_SYNCHRONIZE_MICROCHAINS') }}
        </div>
      </div>
    </div>
    <q-space />
  </div>
  <DbMicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
  <DbMicrochainBridge ref='dbMicrochainBridge' />
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
  <q-dialog v-model='importingMicrochain'>
    <q-card class='dialog page-x-padding page-y-padding'>
      <h5 class='onboarding-page-title text-center page-title'>
        Import microchain
      </h5>
      <ImportMicrochainView @imported='onMicrochainImported' @error='onImportMicrochainError' @canceled='onImportMicrochainCanceled' />
    </q-card>
  </q-dialog>
</template>

<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue'
import { db } from 'src/model'
import { localStore } from 'src/localstores'
import { type Chains } from 'src/__generated__/graphql/service/graphql'
import { useI18n } from 'vue-i18n'

import DbMicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainCardView from './MicrochainCardView.vue'
import CreateMicrochainView from './CreateMicrochainView.vue'
import RpcMicrochainBridge from '../bridge/rpc/MicrochainBridge.vue'
import ImportMicrochainView from './ImportMicrochainView.vue'

const { t } = useI18n({ useScope: 'global' })

const microchainOwners = ref([] as db.MicrochainOwner[])
const microchains = ref([] as db.Microchain[])
const selectedOwner = ref(undefined as unknown as db.Owner)

const displayCount = ref(4)
const displayMicrochains = computed(() => microchains.value.slice(0, displayCount.value))

const creatingMicrochain = ref(false)
const importingMicrochain = ref(false)
const rpcMicrochainBridge = ref<InstanceType<typeof RpcMicrochainBridge>>()
const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()

const microchainsImportState = computed(() => localStore.setting.MicrochainsImportState)

const onMicrochainCreated = async () => {
  creatingMicrochain.value = false
  await loadMicrochains()
}

const onCreateMicrochainError = () => {
  creatingMicrochain.value = false
}

const onCreateMicrochainClick = () => {
  creatingMicrochain.value = true
}

const onImportMicrochainClick = () => {
  importingMicrochain.value = true
}

const onMicrochainImported = async () => {
  importingMicrochain.value = false
  await loadMicrochains()
}

const onImportMicrochainError = () => {
  importingMicrochain.value = false
}

const onImportMicrochainCanceled = () => {
  importingMicrochain.value = false
}

const onViewMoreClick = () => {
  displayCount.value += 4
  displayCount.value = Math.min(displayCount.value, microchains.value.length)
}

const onSynchronizeMicrochainsClick = () => {
  if (!selectedOwner.value) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  rpcMicrochainBridge.value?.chains(selectedOwner.value?.address).then(async (chains: Chains) => {
    for (const microchain of chains.list) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await dbMicrochainBridge.value?.createMicrochain(selectedOwner.value.owner, microchain, undefined, undefined, undefined, chains.default === microchain)
    }
    localStore.notification.pushNotification({
      Title: t('MSG_SYNCHRONIZE_MICROCHAINS'),
      Message: t('MSG_SUCCESS_SYNCHRONIZE_MICROCHAINS'),
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })
  }).catch((error) => {
    localStore.notification.pushNotification({
      Title: t('MSG_SYNCHRONIZE_MICROCHAINS'),
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: t('MSG_FAILED_SYNCHRONIZE_MICROCHAINS', { ERROR: error }),
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  })
}

const loadMicrochainsRecursive = async (total: number, offset: number, limit: number) => {
  if (offset >= total) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  microchains.value.push(...(await dbMicrochainBridge.value?.ownerMicrochains(offset, limit, selectedOwner.value?.owner, true)) || [])
  void loadMicrochainsRecursive(total, offset + limit, limit)
}

const loadMicrochains = async () => {
  if (!selectedOwner.value) return
  microchains.value = []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const count = (await dbMicrochainBridge.value?.microchainsCount()) as number || 0
  await loadMicrochainsRecursive(count, 0, 10)
}

onMounted(async () => {
  await loadMicrochains()
})

const onMicrochainClick = (microchain: db.Microchain) => {
  localStore.setting.HomeAction = localStore.settingDef.HomeAction.SHOW_MICROCHAIN
  localStore.setting.HomeActionParams = microchain
}

watch(microchainsImportState, async () => {
  switch (microchainsImportState.value) {
    case localStore.settingDef.MicrochainsImportState.MicrochainsImported:
      await loadMicrochains()
  }
})

watch(selectedOwner, async () => {
  await loadMicrochains()
})

</script>
