<template>
  <MonoApplicationOperationBridge ref='monoApplicationOperationBridge' />
</template>
<script setup lang='ts'>
import { db } from 'src/model'
import { ref } from 'vue'

import MonoApplicationOperationBridge from './MonoApplicationOperationBridge.vue'

const monoApplicationOperationBridge = ref<InstanceType<typeof MonoApplicationOperationBridge>>()

const subscribeCreationChain = async (chainId: string, force?: boolean): Promise<boolean> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return await monoApplicationOperationBridge.value?.subscribeCreationChainWithType(chainId, db.ApplicationType.AMS, force) || false
}

defineExpose({
  subscribeCreationChain
})

</script>
