<template>
  <div class='full-width page-x-padding page-y-padding'>
    <div v-if='localStore.oneShotSetting.homeAction === localStore.oneShotSettingDef.HomeAction.SHOW_MAIN'>
      <MainInnerView />
    </div>
    <div v-if='localStore.oneShotSetting.homeAction === localStore.oneShotSettingDef.HomeAction.SHOW_MICROCHAIN'>
      <MicrochainDetailView v-if='localStore.oneShotSetting.homeAction' :microchain='(localStore.oneShotSetting.homeActionParams as db.Microchain)' @back='onMicrochainDetailBack' @close='onMicrochainDetailClosed' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { db } from 'src/model'

import MainInnerView from './MainInnerView.vue'
import MicrochainDetailView from '../microchain/MicrochainDetailView.vue'

const onMicrochainDetailBack = () => {
  localStore.oneShotSetting.oneShotSetting.HomeAction = localStore.oneShotSettingDef.HomeAction.SHOW_MAIN
}

const onMicrochainDetailClosed = () => {
  localStore.oneShotSetting.oneShotSetting.HomeAction = localStore.oneShotSettingDef.HomeAction.SHOW_MAIN
}

</script>
