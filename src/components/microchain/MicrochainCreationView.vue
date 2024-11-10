<template>
  <div>
    <div v-html='$t("MSG_PLEASE_BACKUP_MICROCHAIN_CREATION_MATERIALS")' />
    <div class='text-bold vertical-sections-margin decorate-underline'>
      {{ $t('MSG_MICROCHAIN_ID') }}
    </div>
    <div class='word-break-all vertical-items-margin cursor-pointer'>
      {{ microchain.microchain }} <span class='cursor-pointer'><q-icon name='bi-copy' size='12px' /></span>
    </div>
    <div class='text-bold vertical-sections-margin  decorate-underline'>
      {{ $t('MSG_CREATION_MESSAGE') }}
    </div>
    <div class='word-break-all vertical-items-margin cursor-pointer'>
      {{ microchain.messageId }} <span class='cursor-pointer'><q-icon name='bi-copy' size='12px' /></span>
    </div>
    <div class='text-bold vertical-sections-margin  decorate-underline'>
      {{ $t('MSG_CREATION_CERTIFICATE') }}
    </div>
    <div class='word-break-all vertical-items-margin cursor-pointer'>
      {{ microchain.certificateHash }} <span class='cursor-pointer'><q-icon name='bi-copy' size='12px' /></span>
    </div>
    <div class='vertical-sections-margin tip warn'>
      <q-icon name='bi-exclamation-circle' color='red-6' :style='{marginBottom: "4px"}' /> <span v-html='$t("MSG_YOU_MUST_BACKUP_MICROCHAIN_MATERIALS")' />
      <span class='text-blue-8 cursor-pointer' @click='onBackupClick'>{{ $t('MSG_BACKUP') }}</span>
    </div>
    <q-btn
      class='btn vertical-sections-margin extra-margin-bottom full-width' flat no-caps
      @click='onValidateClick'
    >
      {{ $t('MSG_VALIDATE_MICROCHAIN') }}
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
