<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div>
      <div v-if='applications.length > 0'>
        <ApplicationCardView v-for='application in applications' :key='application.applicationId' :application='application' />
      </div>
      <div v-else class='page-item-placeholder'>
        <div class='cursor-pointer'>
          <q-icon name='bi-plus-circle' size='48px' color='grey-4' />
        </div>
        <div class='page-item-y-margin-top' v-html='$t("MSG_NO_APPLICATIONS_CREATE_NEW")' />
      </div>
      <div class='row vertical-items-margin selector-margin-x-left cursor-pointer' @click='onSynchronizeApplicationsClick'>
        <q-icon name='bi-arrow-repeat' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          {{ $t('MSG_SYNCHRONIZE_APPLICATIONS') }}
        </div>
      </div>
    </div>
    <q-space />
  </div>
  <DbApplicationBridge ref='dbApplicationBridge' v-model:applications='applications' />
  <RpcApplicationBridge ref='rpcApplicationBridge' />
  <DbMicrochainBridge v-model:microchains='microchains' />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { db } from 'src/model'
import { localStore } from 'src/localstores'
import { type ApplicationOverview } from 'src/__generated__/graphql/service/graphql'
import { useI18n } from 'vue-i18n'

import RpcApplicationBridge from '../bridge/rpc/ApplicationBridge.vue'
import DbApplicationBridge from '../bridge/db/ApplicationBridge.vue'
import ApplicationCardView from './ApplicationCardView.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'

const { t } = useI18n({ useScope: 'global' })

const rpcApplicationBridge = ref<InstanceType<typeof RpcApplicationBridge>>()
const dbApplicationBridge = ref<InstanceType<typeof DbApplicationBridge>>()

const applications = ref([] as db.Application[])
const microchains = ref([] as db.Microchain[])

const microchainIds = computed(() => microchains.value.reduce((ids: string[], a): string[] => { ids.push(a.microchain); return ids }, []))

const onSynchronizeApplicationsClick = () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  rpcApplicationBridge.value?.applications(microchainIds.value).then(async (resps: ApplicationOverview[]) => {
    for (const resp of resps) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await dbApplicationBridge.value?.addApplication(resp.id, resp.description?.creation?.chainId, resp.description?.creation?.height, resp.description?.creation?.index)
    }
    localStore.notification.pushNotification({
      Title: t('MSG_SYNCHRONIZE_APPLICATIONS'),
      Message: t('MSG_SUCCESS_SYNCHRONIZE_APPLICATIONS'),
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })
  }).catch((error) => {
    localStore.notification.pushNotification({
      Title: t('MSG_SYNCHRONIZE_APPLICATIONS'),
      Message: t('MSG_FAILED_SYNCHRONIZE_APPLICATIONS', { ERROR: error }),
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  })
}

</script>
