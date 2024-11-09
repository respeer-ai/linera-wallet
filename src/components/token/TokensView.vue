<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div>
      <div v-if='tokens.length > 0'>
        <TokenCardView v-for='token in tokens' :key='token.id' :token='token' @click='onTokenClick(token)' />
      </div>
      <div class='row vertical-sections-margin selector-margin-x-left cursor-pointer' @click='onReceiveTokensClick'>
        <q-icon name='bi-plus-lg' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          Receive tokens
        </div>
      </div>
      <div class='row vertical-items-margin selector-margin-x-left cursor-pointer' @click='onImportTokenClick'>
        <q-icon name='bi-plus-lg' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          Import token
        </div>
      </div>
    </div>
    <q-space />
  </div>
  <DbTokenBridge v-model:tokens='tokens' />
  <OwnerBridge v-model:selected-owner='selectedOwner' />
  <q-dialog v-model='importingToken'>
    <q-card class='dialog page-y-padding'>
      <h5 class='onboarding-page-title text-center page-title'>
        Importing ERC20 compatible token
      </h5>
      <ImportTokenView @imported='onTokenImported' @error='onImportTokenError' @canceled='onImportTokenCanceled' />
    </q-card>
  </q-dialog>
  <q-dialog v-model='displayingAccount'>
    <AccountDetailView :owner='selectedOwner' @canceled='onDisplayAccountCanceled' @done='onDisplayAccountDone' />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from 'src/model'
import { localStore } from 'src/localstores'

import DbTokenBridge from '../bridge/db/TokenBridge.vue'
import TokenCardView from './TokenCardView.vue'
import ImportTokenView from './ImportTokenView.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import AccountDetailView from '../account/AccountDetailView.vue'

const tokens = ref([] as db.Token[])
const selectedOwner = ref(undefined as unknown as db.Owner)

const displayingAccount = ref(false)
const importingToken = ref(false)

const onTokenImported = () => {
  importingToken.value = false
}

const onImportTokenError = () => {
  importingToken.value = false
}

const onImportTokenCanceled = () => {
  importingToken.value = false
}

const onImportTokenClick = () => {
  importingToken.value = true
}

const onReceiveTokensClick = () => {
  displayingAccount.value = true
}

const onDisplayAccountCanceled = () => {
  displayingAccount.value = false
}

const onDisplayAccountDone = () => {
  displayingAccount.value = false
}

const onTokenClick = (token: db.Token) => {
  localStore.setting.HomeAction = localStore.settingDef.HomeAction.SHOW_TOKEN
  localStore.setting.HomeActionParams = token
}

</script>
