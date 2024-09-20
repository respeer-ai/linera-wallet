<template>
  <div class='full-width'>
    <div v-if='owners.length'>
      <TokenBalanceView />
    </div>
    <div v-else class='home-create-account'>
      <div class='page-item-placeholder text-center'>
        <div class='cursor-pointer' @click='onCreateAccountClick'>
          <q-icon name='bi-plus-circle' size='48px' color='grey-4' />
        </div>
        <div class='page-item-y-margin-top'>
          No account? <span class='cursor-pointer like-link'>Create</span> or <span class='cursor-pointer like-link'>Import</span>.
        </div>
      </div>
      <div :style='{height: "24px"}' />
    </div>
    <TabsView />
    <OwnerBridge v-model:owners='owners' />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { db } from 'src/model'

import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import TokenBalanceView from './TokenBalanceView.vue'
import TabsView from './TabsView.vue'

const owners = ref([] as db.Owner[])

const onCreateAccountClick = () => {
  // TODO
}

</script>
