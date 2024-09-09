<template>
  <div class='full-width'>
    <PageHeaderView />
    <div class='full-width page-x-padding page-y-padding'>
      <TokenBalanceView />
      <TabsView />
    </div>
  </div>
</template>

<script setup lang='ts'>

import PageHeaderView from '../header/PageHeaderView.vue'
import TokenBalanceView from './TokenBalanceView.vue'
import TabsView from './TabsView.vue'

</script>
