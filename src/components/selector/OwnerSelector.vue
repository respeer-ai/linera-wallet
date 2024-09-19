<template>
  <q-card class='selector-card'>
    <AccountsView v-model='owner' @selected='onOwnerSelected' />
    <div class='selector-action'>
      <q-btn flat class='btn btn-alt full-width' label='Create or import account' no-caps />
    </div>
  </q-card>
</template>

<script setup lang='ts'>
import { db } from 'src/model'

import AccountsView from '../account/AccountsView.vue'

const owner = defineModel<db.Owner>()
const emit = defineEmits<{(ev: 'selected', value: db.Owner): void}>()

const onOwnerSelected = (_owner: db.Owner) => {
  _owner.selected = true
  owner.value = _owner
  emit('selected', _owner)
}

</script>
