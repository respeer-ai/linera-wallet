<template>
  <div>
    <div :class='[ "row", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <AccountDetailAvatarView :owner='owner' :editable='true' />
      <q-space />
      <q-icon name='bi-check-circle-fill' size='16px' color='green-4' v-if='owner.selected' />
      <q-icon name='bi-opencollective' size='16px' color='grey-7' class='page-item-x-margin-left cursor-pointer' />
    </div>
    <div class='vertical-menus-margin text-grey-8 text-bold decorate-underline setting-item-inner-padding'>
      {{ $t('MSG_MICROCHAINS') }}
    </div>
    <div class='vertical-items-margin'>
      <MicrochainsInnerView :searchable='false' :show-indicator='false' @selected='onMicrochainSelected' :x-padding='localStore.setting.extensionMode ? "8px" : "0"' />
      <div class='row vertical-sections-margin selector-margin-left cursor-pointer setting-item-inner-padding' @click='onAddMicrochainClick'>
        <q-icon name='bi-plus-lg' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          {{ $t('MSG_CREATE_MICROCHAIN') }}
        </div>
      </div>
      <div class='row vertical-items-margin selector-margin-left cursor-pointer setting-item-inner-padding' @click='onAddMicrochainClick'>
        <q-icon name='bi-save' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          {{ $t('MSG_EXPORT_ACCOUNT') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { dbModel } from 'src/model'
import { toRef } from 'vue'

import AccountDetailAvatarView from '../account/AccountDetailAvatarView.vue'
import MicrochainsInnerView from '../microchain/MicrochainsInnerView.vue'
import { localStore } from 'src/localstores'

interface Props {
  owner: dbModel.Owner
}
const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const selectedMicrochain = defineModel<dbModel.Microchain>()

const emit = defineEmits<{(ev: 'selected', microchain: dbModel.Microchain): void}>()

const onMicrochainSelected = (microchain: dbModel.Microchain) => {
  selectedMicrochain.value = microchain
  emit('selected', microchain)
}

const onAddMicrochainClick = () => {
  // TODO
}

</script>
