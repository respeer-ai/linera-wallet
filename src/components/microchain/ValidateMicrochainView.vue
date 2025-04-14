<template>
  <div class='full-width'>
    <div v-html='$t("MSG_CHECKO_NEEDS_TO_KNOW_MICROCHAIN_CREATION_MATERIAL_FOR_RECOVERY")' />
    <div class='vertical-sections-margin tip info'>
      <q-icon name='bi-check-circle' color='green-6' :style='{marginBottom: "4px"}' /> {{ $t('MSG_PASTE_MICROCHAIN_CREATION_INFORMATION_TO_VERIFY') }}
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
    <q-btn
      class='btn vertical-sections-margin extra-margin-bottom full-width' flat no-caps
      @click='onValidateClick' :disabled='!canValidate'
    >
      {{ $t('MSG_LETS_GO') }}
    </q-btn>
  </div>
</template>

<script setup lang='ts'>
import { dbModel } from 'src/model'
import { computed, ref, toRef } from 'vue'

interface Props {
  microchain: dbModel.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

const microchainId = ref('')
const messageId = ref('')

const microchainIdError = ref(false)
const messageIdError = ref(false)

const emit = defineEmits<{(ev: 'validated'): void}>()

const canValidate = computed(() => {
  return microchainId.value === microchain.value.microchain ||
         messageId.value === microchain.value.messageId
})

const onValidateClick = () => {
  microchainIdError.value = microchainId.value !== microchain.value.microchain
  messageIdError.value = messageId.value !== microchain.value.messageId
  if (microchainIdError.value || messageIdError.value) return
  emit('validated')
}

</script>
