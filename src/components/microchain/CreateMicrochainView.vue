<!-- eslint-disable @typescript-eslint/no-unsafe-assignment -->
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
    <OpenChain ref='openChain' />
    <RpcOperationBridge ref='rpcOperationBridge' />
    <DbNamedApplicationBridge ref='dbNamedApplicationBridge' />
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { db } from 'src/model'
import { localStore } from 'src/localstores'

import OpenChain from './OpenChain.vue'
import MicrochainCreationView from './MicrochainCreationView.vue'
import ValidateMicrochainView from './ValidateMicrochainView.vue'
import RpcOperationBridge from '../bridge/rpc/OperationBridge.vue'
import DbNamedApplicationBridge from '../bridge/db/NamedApplicationBridge.vue'

const openChain = ref<InstanceType<typeof OpenChain>>()
const rpcOperationBridge = ref<InstanceType<typeof RpcOperationBridge>>()
const dbNamedApplicationBridge = ref<InstanceType<typeof DbNamedApplicationBridge>>()

const createdMicrochain = ref(undefined as unknown as db.Microchain)
const step = ref(1)

const emit = defineEmits<{(ev: 'created', value: db.Microchain): void,
  (ev: 'error'): void
}>()

const createMicrochain = async (): Promise<db.Microchain> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    openChain.value?.openMicrochain().then(async (microchain: db.Microchain) => {
      localStore.notification.pushNotification({
        Title: 'Open chain',
        Message: 'Success open microchain.',
        Popup: true,
        Type: localStore.notify.NotifyType.Info
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      let namedApplication = (await dbNamedApplicationBridge.value?.getNamedApplicationWithType(db.ApplicationType.SWAP)) as db.NamedApplication
      if (!namedApplication) return
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      rpcOperationBridge.value?.requestApplication(namedApplication.creatorChain, namedApplication.applicationId, microchain.microchain)
      // TODO: subscribe SWAP and WLINERA application
      // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
      namedApplication = (await dbNamedApplicationBridge.value?.getNamedApplicationWithType(db.ApplicationType.WLINERA)) as db.NamedApplication
      if (!namedApplication) return
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      rpcOperationBridge.value?.requestApplication(namedApplication.creatorChain, namedApplication.applicationId, microchain.microchain)
      resolve(microchain)
    }).catch((error) => {
      localStore.notification.pushNotification({
        Title: 'Open chain',
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        Message: `Failed open microchain: ${error}.`,
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
