<template>
  <div>
    <p class='text-center text-bold text-grey-9 selector-title'>
      {{ $t('MSG_SELECT_AN_ACCOUNT') }}
    </p>
    <AccountsInnerView :persistent='persistent' :searchable='true' @selected='onOwnerSelected' v-model='owner' />
  </div>
</template>

<script setup lang='ts'>
import { toRef } from 'vue'
import { dbModel } from 'src/model'

import AccountsInnerView from './AccountsInnerView.vue'

interface Props {
  persistent?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  persistent: true
})
const persistent = toRef(props, 'persistent')

const owner = defineModel<dbModel.Owner>()
const emit = defineEmits<{(ev: 'selected', value: dbModel.Owner): void}>()

const onOwnerSelected = (_owner: dbModel.Owner) => {
  owner.value = _owner
  emit('selected', _owner)
}

</script>
