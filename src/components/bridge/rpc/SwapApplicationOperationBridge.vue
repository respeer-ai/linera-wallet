<template>
  <MonoApplicationOperationBridge ref='monoApplicationOperationBridge' />
</template>
<script setup lang='ts'>
import { db } from 'src/model'
import { ref } from 'vue'

import MonoApplicationOperationBridge from './MonoApplicationOperationBridge.vue'

const monoApplicationOperationBridge = ref<InstanceType<typeof MonoApplicationOperationBridge>>()

const subscribeCreationChain = async (chainId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await monoApplicationOperationBridge.value?.subscribeCreationChainWithType(chainId, db.ApplicationType.SWAP)
}

defineExpose({
  subscribeCreationChain
})

</script>
