<template>
  <q-card class='selector-card'>
    <q-stepper
      flat
      v-model='step'
      active-color='brown-8'
      inactive-color='brown-4'
      done-color='green-6'
      animated
      alternative-labels
      header-class='hide'
    >
      <q-step :name='1' title='1' :done='step > 1'>
        <AccountsView v-model='owner' @selected='onOwnerSelected' :persistent='persistent' />
      </q-step>
      <q-step :name='2' title='2' :done='step > 2'>
        <ImportPrivateKeyView @canceled='onImportCanceled' @created='onAccountCreated' @imported='onAccountImported' />
      </q-step>
    </q-stepper>
    <div class='selector-action' v-if='step===1 && creatable'>
      <q-btn
        flat class='btn btn-alt full-width' label='Create or import account' no-caps
        @click='step++'
      />
    </div>
  </q-card>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { ref, toRef } from 'vue'

import AccountsView from '../account/AccountsView.vue'
import ImportPrivateKeyView from '../account/ImportPrivateKeyView.vue'

interface Props {
  creatable?: boolean
  persistent?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  creatable: true
})
const creatable = toRef(props, 'creatable')
const persistent = toRef(props, 'persistent')

const step = ref(1)

const owner = defineModel<db.Owner>()
const emit = defineEmits<{(ev: 'selected', value?: db.Owner): void}>()

const onOwnerSelected = (_owner: db.Owner) => {
  owner.value = _owner
  emit('selected', _owner)
}

const onImportCanceled = () => {
  step.value = 1
}

const onAccountCreated = () => {
  emit('selected')
}

const onAccountImported = () => {
  emit('selected')
}

</script>

<style lang='sass' scoped>
::v-deep .q-stepper__step-inner
  padding: 0 !important
</style>
