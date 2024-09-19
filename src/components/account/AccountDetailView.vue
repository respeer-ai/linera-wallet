<template>
  <div>
    <div v-if='step === 1'>
      <AccountDetailInnerView v-if='owner' :owner='owner' @show-private-key='onShowPrivateKey' />
    </div>
    <div v-if='step === 2'>
      <ShowPrivateKeyView
        v-if='owner' :owner='owner' @canceled='onShowPrivateKeyCanceled' @back='onShowPrivateKeyBack'
        @confirmed='onShowPrivateKeyConfirmed'
      />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { ref, toRef } from 'vue'

import AccountDetailInnerView from './AccountDetailInnerView.vue'
import ShowPrivateKeyView from './ShowPrivateKeyView.vue'

interface Props {
  owner: db.Owner
}
const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const step = ref(1)

const onShowPrivateKey = () => {
  step.value++
}

const onShowPrivateKeyCanceled = () => {
  step.value--
}

const onShowPrivateKeyBack = () => {
  step.value--
}

const onShowPrivateKeyConfirmed = () => {
  step.value++
}

</script>

<style scope lang='sass'>
</style>
