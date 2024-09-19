<template>
  <div class='page-x-padding'>
    <div class='row'>
      <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer' @click='onBackClick' />
      <q-space />
      <p class='text-center text-bold text-grey-9 selector-title'>
        {{ title }}
      </p>
      <q-space />
      <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
    </div>
    <div v-if='step === 1'>
      <ImportPrivateKeyMenuView @create='onCreateAccount' @import='onImportAccount' @add-ledger='onAddLedger' />
    </div>
    <div v-if='step === 2'>
      <div v-if='action === Action.Import'>
        <ImportPrivateKeyInnerView @imported='onAccountImported' @canceled='onImportAccountCanceled' />
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'

import ImportPrivateKeyMenuView from './ImportPrivateKeyMenuView.vue'
import ImportPrivateKeyInnerView from './ImportPrivateKeyInnerView.vue'

const step = ref(1)

enum Action {
  Create,
  Import,
  AddLedger
}

const action = ref(Action.Import)

const title = computed(() => {
  switch (step.value) {
    case 2:
      switch (action.value) {
        case Action.Create: return 'Create account'
        case Action.Import: return 'Import account'
        case Action.AddLedger: return 'Add ledger'
      }
    // eslint-disable-next-line no-fallthrough
    case 1:
    default:
      return 'Add account'
  }
})

const emit = defineEmits<{(ev: 'cancel'): void,
  (ev: 'imported'): void
}>()

const onCloseClick = () => {
  emit('cancel')
}

const onBackClick = () => {
  if (step.value === 1) return emit('cancel')
  step.value--
}

const onCreateAccount = () => {
  action.value = Action.Create
  step.value++
}

const onImportAccount = () => {
  action.value = Action.Import
  step.value++
}

const onAddLedger = () => {
  action.value = Action.AddLedger
  step.value++
}

const onAccountImported = () => {
  emit('imported')
}

const onImportAccountCanceled = () => {
  step.value--
}

</script>
