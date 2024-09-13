<template>
  <div class='full-width'>
    <div class='text-bold vertical-sections-margin decorate-underline'>
      Microchain ID
    </div>
    <q-input v-model='microchainId' type='textarea' :error='microchainIdError' autogrow />
    <div class='text-bold vertical-sections-margin  decorate-underline'>
      Creation message
    </div>
    <q-input v-model='messageId' type='textarea' :error='messageIdError' autogrow />
    <div class='text-bold vertical-sections-margin  decorate-underline'>
      Creation certificate
    </div>
    <q-input v-model='certificateHash' type='textarea' :error='certificateHashError' autogrow />
    <div class='vertical-sections-margin tip info'>
      <q-icon name='bi-check-circle' color='green-6' :style='{marginBottom: "4px"}' /> Paste microchain creation information to input box.
    </div>
    <q-btn
      class='btn vertical-sections-margin extra-margin-bottom' dense flat no-caps
      @click='onValidateClick' :disabled='canValidate'
    >
      Let's go
    </q-btn>
  </div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, ref, toRef } from 'vue'

interface Props {
  microchain: db.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

const microchainId = ref('')
const messageId = ref('')
const certificateHash = ref('')

const microchainIdError = ref(false)
const messageIdError = ref(false)
const certificateHashError = ref(false)

const emit = defineEmits<{(ev: 'validated'): void}>()

const canValidate = computed(() => {
  return microchainId.value !== microchain.value.microchain ||
         messageId.value !== microchain.value.messageId ||
         certificateHash.value !== microchain.value.certificateHash
})

const onValidateClick = () => {
  microchainIdError.value = microchainId.value !== microchain.value.microchain
  messageIdError.value = messageId.value !== microchain.value.messageId
  certificateHashError.value = certificateHash.value !== microchain.value.certificateHash
  if (microchainIdError.value || messageIdError.value || certificateHashError.value) return
  emit('validated')
}

</script>
