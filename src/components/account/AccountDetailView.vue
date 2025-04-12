<template>
  <div>
    <div v-if='step === 1'>
      <AccountDetailInnerView v-if='owner' :owner='owner' @show-private-key='onShowPrivateKey' />
    </div>
    <div v-if='step === 2'>
      <ShowPrivateKeyConfirmView
        v-if='owner' :owner='owner' @canceled='onShowPrivateKeyConfirmCanceled' @back='onShowPrivateKeyConfirmBack'
        @confirmed='onShowPrivateKeyConfirmed'
      />
    </div>
    <div v-if='step === 3'>
      <ShowPrivateKeySecurityConfirmView @canceled='onShowPrivateKeySecurityCanceled' @confirmed='onShowPrivateKeySecurityConfirmed' />
    </div>
    <div v-if='step === 4'>
      <ShowPrivateKeyView :owner='owner' @done='onShowPrivateKeyDone' @canceled='onShowPrivateKeyCanceled' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { dbModel } from 'src/model'
import { ref, toRef } from 'vue'

import AccountDetailInnerView from './AccountDetailInnerView.vue'
import ShowPrivateKeyConfirmView from './ShowPrivateKeyConfirmView.vue'
import ShowPrivateKeySecurityConfirmView from './ShowPrivateKeySecurityConfirmView.vue'
import ShowPrivateKeyView from './ShowPrivateKeyView.vue'

interface Props {
  owner: dbModel.Owner
}
const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const step = ref(1)

const emit = defineEmits<{(ev: 'canceled'): void,
  (ev: 'done'): void
}>()

const onShowPrivateKey = () => {
  step.value++
}

const onShowPrivateKeyConfirmCanceled = () => {
  step.value--
}

const onShowPrivateKeyConfirmBack = () => {
  step.value--
}

const onShowPrivateKeyConfirmed = () => {
  step.value++
}

const onShowPrivateKeySecurityCanceled = () => {
  emit('canceled')
}

const onShowPrivateKeySecurityConfirmed = () => {
  step.value++
}

const onShowPrivateKeyDone = () => {
  emit('done')
}

const onShowPrivateKeyCanceled = () => {
  emit('canceled')
}

</script>

<style scope lang='sass'>
</style>
