<template>
  <div class='full-height setting-item-inner-padding'>
    <RequestAccountsView />
    <GetProviderStateView class='vertical-items-margin' />
    <EthSignView class='vertical-items-margin' />
  </div>
</template>

<script setup lang='ts'>

import RequestAccountsView from './engineering/RequestAccountsView.vue'
import GetProviderStateView from './engineering/GetProviderStateView.vue'
import EthSignView from './engineering/EthSignView.vue'

</script>
