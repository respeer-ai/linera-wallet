<template>
  <div :class='[localStore.setting.extensionMode ? "setting-item-inner-padding" : ""]'>
    <div class='row setting-header'>
      <div class='flex items-center justify-center'>
        <q-icon name='bi-plugin' size='16px' />
      </div>
      <div class='page-item-x-margin-left'>
        {{ $t('MSG_GENESIS') }}
      </div>
    </div>
    <div class='vertical-menus-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
      {{ $t('MSG_ADMIN_CHAIN') }}
    </div>
    <p class='vertical-items-margin text-grey-6 word-break-all'>
      {{ networkInfo?.genesisConfig?.admin_id }}
    </p>
    <div class='vertical-menus-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
      {{ $t('MSG_VERSION') }}
    </div>
    <p class='vertical-items-margin text-grey-6 word-break-all'>
      {{ networkInfo?.version?.crateVersion }}
    </p>
    <div class='vertical-menus-margin text-grey-8 text-bold decorate-underline row flex items-center' :style='{ paddingBottom: "4px" }'>
      {{ $t('MSG_VALIDATORS') }}
    </div>
    <div class='vertical-items-margin text-grey-6 word-break-all'>
      <div v-for='validator in networkInfo?.currentValidators' :key='validator.name'>
        {{ validator.name }}
      </div>
    </div>
  </div>
  <RpcNetworkInfoBridge ref='rpcNetworkInfoBridge' />
</template>

<script setup lang='ts'>
import { computed, onMounted, ref } from 'vue'
import { localStore } from 'src/localstores'
import { type NetworkInfoQuery } from 'src/__generated__/graphql/faucet/graphql'

import RpcNetworkInfoBridge from '../bridge/rpc/NetworkInfoBridge.vue'

const rpcNetworkInfoBridge = ref<InstanceType<typeof RpcNetworkInfoBridge>>()

// eslint-disable-next-line @typescript-eslint/no-unsafe-return
const networkInfo = computed(() => localStore.setting._networkInfo as NetworkInfoQuery)

onMounted(async () => {
  if (!networkInfo.value) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    localStore.setting.NetworkInfo = await rpcNetworkInfoBridge.value?.getNetworkInfo() as NetworkInfoQuery
  }
})

</script>
