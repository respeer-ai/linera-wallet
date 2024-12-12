<template>
  <q-item class='row full-width tab-panel-item' :style='{ paddingLeft: xPadding, paddingRight: xPadding }'>
    <q-avatar>
      <q-icon name='bi-box-seam' />
    </q-avatar>
    <div class='selector-margin-x-left'>
      <div class='text-bold text-grey-9 text-left'>
        {{ applicationName }}
      </div>
      <div class='text-grey-6 text-left'>
        {{ shortid.shortId(namedApplication.applicationId, 8) }}
      </div>
    </div>
    <q-space />
    <div v-if='!requested || !subscribed' class='selector-margin-x-left'>
      <q-btn
        flat rounded dense :label='btnLabel'
        @click='onRequestNowClick'
        :style='{fontSize: "12px"}'
        class='text-blue-6' :loading='requesting'
      >
        <template #loading>
          <div>
            <q-spinner-facebook class='on-left' />
            <div>{{ btnLabel }}</div>
          </div>
        </template>
      </q-btn>
    </div>
  </q-item>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { rpcBridge } from 'src/bridge'
import { shortid } from 'src/utils'
import { useI18n } from 'vue-i18n'
import { localStore } from 'src/localstores'

const { t } = useI18n({ useScope: 'global' })

interface Props {
  namedApplication: db.NamedApplication
  microchain: db.Microchain
  xPadding?: string
  requested: boolean
}
const props = withDefaults(defineProps<Props>(), {
  xPadding: '0'
})
const namedApplication = toRef(props, 'namedApplication')
const microchain = toRef(props, 'microchain')
const requesting = ref(false)
const xPadding = toRef(props, 'xPadding')
const requested = toRef(props, 'requested')

const btnLabel = ref(t('MSG_REQUEST_NOW'))
const subscribed = ref(false)

const applicationName = computed(() => {
  switch (namedApplication.value.applicationType) {
    case db.ApplicationType.AMS: return 'Application management service'
    case db.ApplicationType.SWAP: return 'Linera Swap application'
    case db.ApplicationType.BLOB_GATEWAY: return 'Linera Blob Gateway application'
    default: return 'Unknown application'
  }
})

const emit = defineEmits<{(ev: 'requested', applicationId: string): void}>()

const onRequestNowClick = async () => {
  requesting.value = true

  try {
    btnLabel.value = t('MSG_REQUESTING_THREE_DOTS')
    const operationId = await rpcBridge.Operation.requestApplication(microchain.value.microchain, namedApplication.value.applicationId, namedApplication.value.applicationType)
    if (operationId) {
      await rpcBridge.Operation.waitOperation(operationId)
    }
    btnLabel.value = t('MSG_WAITING_THREE_DOTS')
    await rpcBridge.ApplicationOperation.waitExistChainApplication(microchain.value.microchain, namedApplication.value.applicationId, 60)

    if (namedApplication.value.applicationType !== db.ApplicationType.BLOB_GATEWAY) {
      btnLabel.value = t('MSG_SUBSCRIBING_THREE_DOTS')
      await rpcBridge.MonoApplicationOperation.subscribeCreationChainWithType(microchain.value.microchain, namedApplication.value.applicationType)
      setTimeout(() => {
        rpcBridge.ApplicationOperation.subscribedCreatorChain(microchain.value.microchain, namedApplication.value.applicationId).then((_subscribed) => {
          subscribed.value = _subscribed
        }).catch(() => {
          // DO NOTHING
        })
      }, 1000)
    } else {
      subscribed.value = true
    }

    emit('requested', namedApplication.value.applicationId)

    localStore.notification.pushNotification({
      Title: t('MSG_REQUEST_APPLICATION'),
      Message: t('MSG_SUCCESS_REQUEST_APPLICATION'),
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })
  } catch (e) {
    localStore.notification.pushNotification({
      Title: t('MSG_REQUEST_APPLICATION'),
      Message: t('MSG_FAILED_REQUEST_APPLICATION'),
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  }
  btnLabel.value = t('MSG_REQUEST_NOW')
  requesting.value = false
}

watch(requested, async () => {
  if (!requested.value) return
  if (namedApplication.value.applicationType !== db.ApplicationType.BLOB_GATEWAY) {
    subscribed.value = await rpcBridge.ApplicationOperation.subscribedCreatorChain(microchain.value.microchain, namedApplication.value.applicationId)
  } else {
    subscribed.value = true
  }
})

onMounted(async () => {
  if (!requested.value) return
  if (namedApplication.value.applicationType !== db.ApplicationType.BLOB_GATEWAY) {
    subscribed.value = await rpcBridge.ApplicationOperation.subscribedCreatorChain(microchain.value.microchain, namedApplication.value.applicationId)
  } else {
    subscribed.value = true
  }
})

</script>
