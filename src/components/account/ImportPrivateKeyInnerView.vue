<template>
  <div>
    <div>
      Imported account won't be bound to current mnemonic.
    </div>
    <div class='vertical-sections-margin text-grey-8 text-bold'>
      Private key
    </div>
    <div class='vertical-items-margin'>
      <q-input outlined dense v-model='privateKey' :type='showPlainText ? "text" : "password"'>
        <template #append>
          <q-icon :name='showPlainText ? "bi-eye-fill" : "bi-eye-slash-fill"' class='cursor-pointer' @click='showPlainText = !showPlainText' />
        </template>
      </q-input>
    </div>
    <q-btn
      flat dense class='btn full-width vertical-sections-margin' @click='onImportClick'
      no-caps
    >
      Import
    </q-btn>
    <q-btn
      flat dense class='btn btn-alt full-width vertical-items-margin' @click='onCancelClick'
      no-caps
    >
      Cancel
    </q-btn>
  </div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { ref } from 'vue'

const privateKey = ref('')
const showPlainText = ref(false)

const emit = defineEmits<{(ev: 'imported', value: db.Owner): void,
  (ev: 'canceled'): void
}>()

const onImportClick = () => {
  // TODO
}

const onCancelClick = () => {
  emit('canceled')
}

</script>
