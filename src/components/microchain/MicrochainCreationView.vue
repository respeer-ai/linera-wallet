<template>
  <div>
    <div class='text-bold vertical-sections-margin decorate-underline'>
      Microchain ID
    </div>
    <div class='word-break-all vertical-items-margin cursor-pointer'>
      {{ microchain.microchain }} <span class='cursor-pointer'><q-icon name='bi-copy' size='12px' /></span>
    </div>
    <div class='text-bold vertical-sections-margin  decorate-underline'>
      Microchain creation message
    </div>
    <div class='word-break-all vertical-items-margin cursor-pointer'>
      {{ microchain.messageId }} <span class='cursor-pointer'><q-icon name='bi-copy' size='12px' /></span>
    </div>
    <div class='text-bold vertical-sections-margin  decorate-underline'>
      Microchain creation certificate
    </div>
    <div class='word-break-all vertical-items-margin cursor-pointer'>
      {{ microchain.certificateHash }} <span class='cursor-pointer'><q-icon name='bi-copy' size='12px' /></span>
    </div>
    <div class='vertical-sections-margin tip'>
      <q-icon name='bi-exclamation-circle' color='red-6' :style='{marginBottom: "4px"}' /> You <strong>must backup</strong> microchain creation message for late recovery.
      <span class='text-blue-8 cursor-pointer'>Backup</span>
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

</script>
