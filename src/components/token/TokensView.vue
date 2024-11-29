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
          {{ $t('MSG_RECEIVE_TOKENS') }}
        </div>
      </div>
      <div class='row vertical-items-margin selector-margin-x-left cursor-pointer' @click='onImportTokenClick'>
        <q-icon name='bi-plus-lg' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
          {{ $t('MSG_IMPORT_TOKEN') }}
        </div>
      </div>
    </div>
    <q-space />
  </div>
  <OwnerBridge v-model:selected-owner='selectedOwner' />
  <TokenBridge v-model:count='count' />
  <q-dialog v-model='importingToken'>
    <q-card class='dialog page-y-padding'>
      <h5 class='onboarding-page-title text-center page-title'>
        {{ $t('MSG_IMPORT_ERC20_COMPATIBLE_TOKEN') }}
      </h5>
      <ImportTokenView @imported='onTokenImported' @error='onImportTokenError' @canceled='onImportTokenCanceled' />
    </q-card>
  </q-dialog>
  <q-dialog v-model='displayingAccount'>
    <AccountDetailView :owner='selectedOwner' @canceled='onDisplayAccountCanceled' @done='onDisplayAccountDone' />
  </q-dialog>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { db } from 'src/model'
import { localStore } from 'src/localstores'
import { dbBridge } from 'src/bridge'

import TokenCardView from './TokenCardView.vue'
import ImportTokenView from './ImportTokenView.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import AccountDetailView from '../account/AccountDetailView.vue'
import TokenBridge from '../bridge/db/TokenBridge.vue'

const tokens = ref([] as db.Token[])
const count = ref(0)
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

const loadTokensRecursive = async (total: number, offset: number, limit: number, _tokens: db.Token[]) => {
  if (offset >= total) {
    tokens.value = _tokens
    return
  }
  _tokens.push(...await dbBridge.Token.tokens(offset, limit))
  void loadTokensRecursive(total, offset + limit, limit, _tokens)
}

const loadTokens = async () => {
  const count = await dbBridge.Token.count()
  await loadTokensRecursive(count, 0, 10, [])
}

watch(count, async () => {
  await loadTokens()
})

onMounted(() => {
  void loadTokens()
})

</script>
