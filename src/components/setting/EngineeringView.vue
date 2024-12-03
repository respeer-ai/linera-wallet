<template>
  <div class='full-height setting-item-inner-padding'>
    <RequestAccountsView />
    <GetProviderStateView class='vertical-items-margin' />
    <EthSignView class='vertical-items-margin' />
    <LineraMutationTransfer class='vertical-items-margin' />
    <RequestApplication class='vertical-items-margin' />
    <SubscribeCreatorChain class='vertical-items-margin' />
    <PublishDataBlob class='vertical-items-margin' />
  </div>
</template>

<script setup lang='ts'>

import RequestAccountsView from './engineering/RequestAccountsView.vue'
import GetProviderStateView from './engineering/GetProviderStateView.vue'
import EthSignView from './engineering/EthSignView.vue'
import LineraMutationTransfer from './engineering/LineraMutationTransfer.vue'
import RequestApplication from './engineering/RequestApplication.vue'
import SubscribeCreatorChain from './engineering/SubscribeCreatorChain.vue'
import PublishDataBlob from './engineering/PublishDataBlob.vue'

</script>
