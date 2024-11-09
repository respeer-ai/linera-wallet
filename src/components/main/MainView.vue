<template>
  <div :class='[ "full-width page-y-padding", localStore.setting.extensionMode ? "" : "page-x-padding" ]'>
    <div v-if='localStore.setting.homeAction === localStore.settingDef.HomeAction.SHOW_MAIN'>
      <MainInnerView />
    </div>
    <div v-if='localStore.setting.homeAction === localStore.settingDef.HomeAction.SHOW_MICROCHAIN'>
      <MicrochainDetailView :microchain='(localStore.setting.homeActionParams as db.Microchain)' @back='onMicrochainDetailBack' @close='onMicrochainDetailClosed' />
    </div>
    <div v-if='localStore.setting.homeAction === localStore.settingDef.HomeAction.SHOW_TOKEN'>
      <TokenDetailView :token='(localStore.setting.homeActionParams as db.Token)' @back='onTokenDetailBack' @close='onTokenDetailClosed' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { db } from 'src/model'

import MainInnerView from './MainInnerView.vue'
import MicrochainDetailView from '../microchain/MicrochainDetailView.vue'
import TokenDetailView from '../token/TokenDetailView.vue'

const onMicrochainDetailBack = () => {
  localStore.setting.HomeAction = localStore.settingDef.HomeAction.SHOW_MAIN
}

const onMicrochainDetailClosed = () => {
  localStore.setting.HomeAction = localStore.settingDef.HomeAction.SHOW_MAIN
}

const onTokenDetailBack = () => {
  localStore.setting.HomeAction = localStore.settingDef.HomeAction.SHOW_MAIN
}

const onTokenDetailClosed = () => {
  localStore.setting.HomeAction = localStore.settingDef.HomeAction.SHOW_MAIN
}

</script>
