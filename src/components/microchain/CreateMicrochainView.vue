<template>
  <div class='full-width'>
    <q-stepper
      flat v-model='step' animated
      alternative-labels
      header-class='hide'
      :style='{marginTop: "-16px"}'
    >
      <q-step :name='1' :done='step > 1' title='Creating' class='flex items-center justify-center'>
        <q-card flat class='loading-card'>
          <q-inner-loading
            :showing='createdMicrochain === undefined'
            class='text-red-4'
          >
            <q-spinner-facebook size='80px' />
          </q-inner-loading>
        </q-card>
      </q-step>
      <q-step :name='2' :done='step > 2' title='Backup'>
        <MicrochainCreationView :microchain='createdMicrochain' @backuped='onMicrochainBackuped' />
      </q-step>
      <q-step :name='3' :done='step > 3' title='Validate'>
        <ValidateMicrochainView :microchain='createdMicrochain' @validated='onMicrochainValidated' />
      </q-step>
    </q-stepper>
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { db } from 'src/model'
import { localStore } from 'src/localstores'
import { useI18n } from 'vue-i18n'
import { dbBridge, rpcBridge } from 'src/bridge'

import MicrochainCreationView from './MicrochainCreationView.vue'
import ValidateMicrochainView from './ValidateMicrochainView.vue'

const { t } = useI18n({ useScope: 'global' })

const createdMicrochain = ref(undefined as unknown as db.Microchain)
const step = ref(1)

const emit = defineEmits<{(ev: 'created', value: db.Microchain): void,
  (ev: 'error'): void
}>()

const importPresetApplications = async (microchain: db.Microchain) => {
  const _microchain = await dbBridge.Microchain.microchain(microchain.microchain)
  if (!_microchain?.opened) {
    return setTimeout(() => {
      void importPresetApplications(microchain)
    }, 1000)
  }

  let namedApplication = (await dbBridge.NamedApplication.namedApplicationWithType(db.ApplicationType.SWAP)) as db.NamedApplication
  if (!namedApplication) return
  let operationId = await rpcBridge.Operation.requestApplication(microchain.microchain, namedApplication.applicationId, db.ApplicationType.SWAP)
  if (operationId) {
    await rpcBridge.Operation.waitOperation(operationId)
  }
  await rpcBridge.SwapApplicationOperation.subscribeCreationChain(microchain.microchain)

  namedApplication = (await dbBridge.NamedApplication.namedApplicationWithType(db.ApplicationType.WLINERA)) as db.NamedApplication
  if (!namedApplication) return
  await rpcBridge.ERC20ApplicationOperation.persistApplication(microchain.microchain, namedApplication.applicationId, db.ApplicationType.WLINERA)

  namedApplication = (await dbBridge.NamedApplication.namedApplicationWithType(db.ApplicationType.AMS)) as db.NamedApplication
  if (!namedApplication) return
  operationId = await rpcBridge.Operation.requestApplication(microchain.microchain, namedApplication.applicationId, db.ApplicationType.AMS)
  if (operationId) {
    await rpcBridge.Operation.waitOperation(operationId)
  }
  await rpcBridge.AMSApplicationOperation.subscribeCreationChain(microchain.microchain)
}

const createMicrochain = async (): Promise<db.Microchain> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    rpcBridge.Microchain.openMicrochain().then(async (microchain: db.Microchain) => {
      localStore.notification.pushNotification({
        Title: t('MSG_OPEN_CHAIN'),
        Message: t('MSG_SUCCESS_OPEN_MICROCHAIN'),
        Popup: true,
        Type: localStore.notify.NotifyType.Info
      })

      await importPresetApplications(microchain)

      resolve(microchain)
    }).catch((error) => {
      localStore.notification.pushNotification({
        Title: t('MSG_OPEN_CHAIN'),
        Message: t('MSG_FAILED_OPEN_MICROCHAIN', { ERROR: error }),
        Popup: true,
        Type: localStore.notify.NotifyType.Error
      })
      reject(error)
    })
  })
}

onMounted(() => {
  createMicrochain().then((microchain) => {
    createdMicrochain.value = microchain
    step.value++
  }).catch(() => {
    emit('error')
  })
})

const onMicrochainBackuped = () => {
  step.value++
}

const onMicrochainValidated = () => {
  emit('created', createdMicrochain.value)
}

</script>
