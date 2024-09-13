<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div>
      <div v-if='tokens.length > 0'>
        <TokenCardView v-for='token in tokens' :key='token.id' :token='token' />
      </div>
      <div class='row vertical-sections-margin selector-margin-x-left cursor-pointer' @click='onCreateTokenClick'>
        <q-icon name='bi-plus' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold'>
          Receive tokens
        </div>
      </div>
      <div class='row vertical-items-margin selector-margin-x-left cursor-pointer' @click='onImportTokenClick'>
        <q-icon name='bi-plus' size='20px' color='blue-10' />
        <div class='text-left text-blue-8 text-bold'>
          Import token
        </div>
      </div>
    </div>
    <q-space />
  </div>
  <DbTokenBridge v-model:tokens='tokens' />
  <q-dialog v-model='creatingToken'>
    <q-card class='dialog'>
      <h5 class='onboarding-page-title text-center page-title'>
        Create token
      </h5>
      <CreateTokenView @created='onTokenCreated' @error='onCreateTokenError' />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { db } from 'src/model'

import DbTokenBridge from '../bridge/db/TokenBridge.vue'
import TokenCardView from './TokenCardView.vue'
import CreateTokenView from './CreateTokenView.vue'

const tokens = ref([] as db.Token[])

const creatingToken = ref(false)

const onTokenCreated = () => {
  creatingToken.value = false
}

const onCreateTokenError = () => {
  creatingToken.value = false
}

const onCreateTokenClick = () => {
  creatingToken.value = true
}

const onImportTokenClick = () => {
  // TODO
}

</script>
