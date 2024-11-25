<template>
  <div class='full-width'>
    <div v-html='$t("MSG_CHECKO_NEEDS_TO_KNOW_MICROCHAIN_CREATION_MATERIAL_FOR_RECOVERY")' />
    <div class='vertical-sections-margin tip info'>
      <q-icon name='bi-check-circle' color='green-6' :style='{marginBottom: "4px"}' /> {{ $t('MSG_PASTE_MICROCHAIN_CREATION_INFORMATION_TO_INPUT_BOX') }}
    </div>
    <div class='text-bold vertical-sections-margin'>
      {{ $t('MSG_MICROCHAIN_ID') }}
    </div>
    <q-input
      outlined v-model='microchainId' type='textarea' :error='microchainIdError'
      autogrow hide-bottom-space class='vertical-items-margin'
    />
    <div class='text-bold vertical-menus-margin'>
      {{ $t('MSG_CREATION_MESSAGE') }}
    </div>
    <q-input
      outlined v-model='messageId' type='textarea' :error='messageIdError'
      autogrow hide-bottom-space class='vertical-items-margin'
    />
    <div class='text-bold vertical-menus-margin'>
      {{ $t('MSG_CREATION_CERTIFICATE') }}
    </div>
    <q-input
      outlined v-model='certificateHash' type='textarea' :error='certificateHashError'
      autogrow hide-bottom-space class='vertical-items-margin'
    />
    <q-btn
      class='btn vertical-sections-margin full-width' flat no-caps
      @click='onImportClick' :disabled='!canImport'
    >
      {{ $t('MSG_IMPORT') }}
    </q-btn>
    <q-btn
      class='btn btn-alt vertical-items-margin extra-margin-bottom full-width' flat no-caps
      @click='onCancelClick'
    >
      {{ $t('MSG_CANCEL') }}
    </q-btn>
  </div>
  <OpenChain ref='openChain' />
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'
import { localStore } from 'src/localstores'
import { useI18n } from 'vue-i18n'

import OpenChain from './OpenChain.vue'

const { t } = useI18n({ useScope: 'global' })

const microchainId = ref('')
const messageId = ref('')
const certificateHash = ref('')

const microchainIdError = ref(false)
const messageIdError = ref(false)
const certificateHashError = ref(false)

const openChain = ref<InstanceType<typeof OpenChain>>()

const emit = defineEmits<{(ev: 'imported'): void,
  (ev: 'error'): void,
  (ev: 'canceled'): void
}>()

const canImport = computed(() => {
  return microchainId.value.length > 0 &&
         messageId.value.length > 0 &&
         certificateHash.value.length > 0
})

const onImportClick = () => {
  microchainIdError.value = microchainId.value.length === 0
  messageIdError.value = messageId.value.length === 0
  certificateHashError.value = certificateHash.value.length === 0
  if (microchainIdError.value || messageIdError.value || certificateHashError.value) return

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  openChain.value?.importMicrochain(microchainId.value, messageId.value, certificateHash.value).then(() => {
    localStore.notification.pushNotification({
      Title: t('MSG_IMPORT_MICROCHAIN'),
      Message: t('MSG_SUCCESS_IMPORT_MICROCHAIN'),
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })
    emit('imported')
  }).catch((error) => {
    localStore.notification.pushNotification({
      Title: t('MSG_IMPORT_MICROCHAIN'),
      Message: t('MSG_FAILED_IMPORT_MICROCHAIN', { ERROR: error }),
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
    emit('error')
  })
}

const onCancelClick = () => {
  emit('canceled')
}

</script>
