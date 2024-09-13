<template>
  <div>
    <div class='text-bold vertical-sections-margin decorate-underline'>
      Microchain ID
    </div>
    <div class='word-break-all vertical-items-margin cursor-pointer'>
      {{ microchain.microchain }} <span class='cursor-pointer'><q-icon name='bi-copy' size='12px' /></span>
    </div>
    <div class='text-bold vertical-sections-margin  decorate-underline'>
      Creation message
    </div>
    <div class='word-break-all vertical-items-margin cursor-pointer'>
      {{ microchain.messageId }} <span class='cursor-pointer'><q-icon name='bi-copy' size='12px' /></span>
    </div>
    <div class='text-bold vertical-sections-margin  decorate-underline'>
      Creation certificate
    </div>
    <div class='word-break-all vertical-items-margin cursor-pointer'>
      {{ microchain.certificateHash }} <span class='cursor-pointer'><q-icon name='bi-copy' size='12px' /></span>
    </div>
    <div class='vertical-sections-margin tip warn'>
      <q-icon name='bi-exclamation-circle' color='red-6' :style='{marginBottom: "4px"}' /> You <strong>must backup</strong> microchain creation message for late recovery.
      <span class='text-blue-8 cursor-pointer' @click='onBackupClick'>Backup</span>
    </div>
    <q-btn
      class='btn vertical-sections-margin extra-margin-bottom' dense flat no-caps
      @click='onValidateClick'
    >
      Validate microchain
    </q-btn>
  </div>
</template>

<script setup lang='ts'>
import { copyToClipboard } from 'quasar'
import { localStore } from 'src/localstores'
import { db } from 'src/model'
import { toRef } from 'vue'

interface Props {
  microchain: db.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

const emit = defineEmits<{(ev: 'backuped'): void}>()
const onValidateClick = () => {
  emit('backuped')
}

const onBackupClick = () => {
  copyToClipboard(JSON.stringify(microchain.value)).then(() => {
    localStore.notification.pushNotification({
      Title: 'Copy Address',
      Message: 'Success copy microchain creation information to clipboard.',
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })
  }).catch((e) => {
    console.log('Fail copy microchain creation information', e)
  })
}

</script>
