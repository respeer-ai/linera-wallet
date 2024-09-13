<template>
  <div class='full-width'>
    <div class='text-bold vertical-sections-margin decorate-underline'>
      Microchain ID
    </div>
    <q-input v-model='microchainId' type='textarea' :error='microchainIdError' />
    <div class='text-bold vertical-sections-margin  decorate-underline'>
      Microchain creation message
    </div>
    <q-input v-model='messageId' type='textarea' :error='messageIdError' />
    <div class='text-bold vertical-sections-margin  decorate-underline'>
      Microchain creation certificate
    </div>
    <q-input v-model='certificateHash' type='textarea' :error='certificateHashError' />
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
