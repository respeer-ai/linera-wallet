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
  <OwnerBridge v-model:selected-owner='selectedOwner' />
  <DbMicrochainBridge v-model:count='count' />
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
import { dbModel } from 'src/model'
import { localStore } from 'src/localstores'
import { type Chains } from 'src/__generated__/graphql/service/graphql'
import { useI18n } from 'vue-i18n'
import { dbBridge, rpcBridge } from 'src/bridge'

import DbMicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainCardView from './MicrochainCardView.vue'
import CreateMicrochainView from './CreateMicrochainView.vue'
import ImportMicrochainView from './ImportMicrochainView.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'

const { t } = useI18n({ useScope: 'global' })

const microchainOwners = ref([] as dbModel.MicrochainOwner[])
const microchains = ref([] as dbModel.Microchain[])
const selectedOwner = ref(undefined as unknown as dbModel.Owner)
const count = ref(0)

const displayCount = ref(4)
const displayMicrochains = computed(() => microchains.value.slice(0, displayCount.value))

const creatingMicrochain = ref(false)
const importingMicrochain = ref(false)

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
  rpcBridge.Microchain.chains(selectedOwner.value?.owner).then(async (chains: Chains | undefined) => {
    for (const microchain of chains?.list || []) {
      await dbBridge.Microchain.create(selectedOwner.value.owner, microchain as string, undefined, undefined, undefined, chains?.default === microchain)
    }
    await loadMicrochains()
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

const loadMicrochainsRecursive = async (total: number, offset: number, limit: number, _microchains: dbModel.Microchain[]) => {
  if (offset >= total) {
    microchains.value = _microchains
    return
  }
  _microchains.push(...await dbBridge.Microchain.microchains(offset, limit, true, undefined, selectedOwner.value?.owner))
  void loadMicrochainsRecursive(total, offset + limit, limit, _microchains)
}

const loadMicrochains = async () => {
  if (!selectedOwner.value) return
  const count = await dbBridge.Microchain.count()
  await loadMicrochainsRecursive(count, 0, 10, [])
}

watch(count, async () => {
  await loadMicrochains()
})

onMounted(async () => {
  await loadMicrochains()
})

const onMicrochainClick = (microchain: dbModel.Microchain) => {
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
