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
    <div v-if='!requested' class='selector-margin-x-left'>
      <q-btn
        flat rounded dense :label='$t("MSG_REQUEST_NOW")'
        @click='onRequestNowClick'
        :style='{fontSize: "12px"}'
        class='text-blue-6' :loading='requesting'
      />
    </div>
  </q-item>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, ref, toRef } from 'vue'
import { rpcBridge } from 'src/bridge'
import { shortid } from 'src/utils'

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

const applicationName = computed(() => {
  switch (namedApplication.value.applicationType) {
    case db.ApplicationType.AMS: return 'Application management service'
    case db.ApplicationType.SWAP: return 'Linera Swap application'
    case db.ApplicationType.BLOB_GATEWAY: return 'Linera Blob Gateway application'
    default: return 'Unknown application'
  }
})

const onRequestNowClick = async () => {
  requesting.value = true
  const operationId = await rpcBridge.Operation.requestApplication(microchain.value.microchain, namedApplication.value.applicationId, namedApplication.value.applicationType)
  if (operationId) {
    await rpcBridge.Operation.waitOperation(operationId)
  }
  await rpcBridge.ApplicationOperation.waitExistChainApplication(microchain.value.microchain, namedApplication.value.applicationId, 10)
  await rpcBridge.AMSApplicationOperation.subscribeCreationChain(microchain.value.microchain)
  requesting.value = false
}

</script>
