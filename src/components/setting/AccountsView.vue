<template>
  <div class='extra-margin-bottom'>
    <div :class='[ "row", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='flex items-center justify-center'>
        <q-icon name='bi-view-list' size='16px' />
      </div>
      <div class='head-separator flex items-center justify-center'>
        <q-icon name='bi-chevron-right' size='12px' />
      </div>
      <div :class='[ "label-text-small cursor-pointer", step === 1 ? "" : "text-grey-8" ]' @click='onAccountsClick'>
        Accounts
      </div>
      <div v-if='step >= 2' class='head-separator flex items-center justify-center'>
        <q-icon name='bi-chevron-right' size='12px' />
      </div>
      <div v-if='step >= 2' :class='[ "label-text-small cursor-pointer", step === 2 ? "" : "text-grey-8" ]' @click='onMicrochainsClick'>
        Microchains
      </div>
      <div v-if='step === 3' class='head-separator flex items-center justify-center'>
        <q-icon name='bi-chevron-right' size='12px' />
      </div>
      <div v-if='step === 3' class='label-text-small cursor-pointer'>
        0x{{ shortid.shortId(selectedMicrochain.microchain, 4) }}
      </div>
    </div>
    <div class='vertical-menus-margin'>
      <div v-if='step === 1'>
        <AccountsInnerView v-model='selectedOwner' :persistent='false' :searchable='false' @selected='onAccountClick' />
        <div class='row vertical-sections-margin selectable-margin-left cursor-pointer' @click='onAddAccountClick'>
          <q-icon name='bi-plus-lg' size='20px' color='blue-10' />
          <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
            Add account
          </div>
        </div>
        <div class='row vertical-items-margin selectable-margin-left cursor-pointer' @click='onAddAccountClick'>
          <q-icon name='bi-save' size='20px' color='blue-10' />
          <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
            Export all
          </div>
        </div>
      </div>
      <div v-if='step === 2'>
        <AccountMicrochainsView v-model='selectedMicrochain' :owner='selectedOwner' @selected='onMicrochainSelected' />
      </div>
      <div v-if='step === 3'>
        <MicrochainDetailView :microchain='selectedMicrochain' />
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { ref } from 'vue'
import { shortid } from 'src/utils'

import AccountsInnerView from '../account/AccountsInnerView.vue'
import AccountMicrochainsView from './AccountMicrochainsView.vue'
import MicrochainDetailView from './MicrochainDetailView.vue'
import { localStore } from 'src/localstores'

const step = ref(1)
const selectedOwner = ref(undefined as unknown as db.Owner)
const selectedMicrochain = ref(undefined as unknown as db.Microchain)

const onAccountClick = (owner: db.Owner) => {
  step.value++
  selectedOwner.value = owner
}

const onAccountsClick = () => {
  step.value = 1
}

const onMicrochainsClick = () => {
  step.value = 2
}

const onAddAccountClick = () => {
  // TODO
}

const emit = defineEmits<{(ev: 'back'): void}>()

const back = () => {
  if (step.value === 1) return emit('back')
  step.value--
}

defineExpose({
  back
})

const onMicrochainSelected = () => {
  step.value++
}

</script>
