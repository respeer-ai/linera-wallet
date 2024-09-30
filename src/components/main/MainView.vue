<template>
  <div :class='[ "full-width page-y-padding", localStore.setting.extensionMode ? "" : "page-x-padding" ]'>
    <div v-if='localStore.setting.homeAction === localStore.settingDef.HomeAction.SHOW_MAIN'>
      <MainInnerView />
    </div>
    <div v-if='localStore.setting.homeAction === localStore.settingDef.HomeAction.SHOW_MICROCHAIN'>
      <MicrochainDetailView v-if='localStore.setting.homeAction' :microchain='(localStore.setting.homeActionParams as db.Microchain)' @back='onMicrochainDetailBack' @close='onMicrochainDetailClosed' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { db } from 'src/model'

import MainInnerView from './MainInnerView.vue'
import MicrochainDetailView from '../microchain/MicrochainDetailView.vue'

const onMicrochainDetailBack = () => {
  localStore.setting.HomeAction = localStore.settingDef.HomeAction.SHOW_MAIN
}

const onMicrochainDetailClosed = () => {
  localStore.setting.HomeAction = localStore.settingDef.HomeAction.SHOW_MAIN
}

</script>
