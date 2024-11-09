<template>
  <DbNamedApplicationBridge ref='dbNamedApplicationBridge' />
  <RpcApplicationBridge ref='rpcApplicationBridge' />
  <RpcApplicationOperationBridge ref='rpcApplicationOperationBridge' />
</template>
<script setup lang='ts'>
import { db } from 'src/model'
import { ref } from 'vue'
import { type ApplicationOverview } from 'src/__generated__/graphql/service/graphql'

import DbNamedApplicationBridge from '../db/NamedApplicationBridge.vue'
import RpcApplicationBridge from './ApplicationBridge.vue'
import RpcApplicationOperationBridge from './ApplicationOperationBridge.vue'

const dbNamedApplicationBridge = ref<InstanceType<typeof DbNamedApplicationBridge>>()
const rpcApplicationBridge = ref<InstanceType<typeof RpcApplicationBridge>>()
const rpcApplicationOperationBridge = ref<InstanceType<typeof RpcApplicationOperationBridge>>()

const subscribeCreationChainWithId = async (chainId: string, applicationId: string, applicationType: db.ApplicationType, force?: boolean): Promise<boolean> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const applications = await rpcApplicationBridge.value?.microchainApplications(chainId) as ApplicationOverview[]
  if (!applications) return false
  if (applications?.findIndex((el: ApplicationOverview) => el.id === applicationId) < 0) return false
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return await rpcApplicationOperationBridge.value?.subscribeCreatorChain(chainId, applicationId, applicationType, force) || false
}

const subscribeCreationChainWithType = async (chainId: string, applicationType: db.ApplicationType, force?: boolean): Promise<boolean> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const application = await dbNamedApplicationBridge.value?.getNamedApplicationWithType(applicationType) as db.NamedApplication
  if (!application) return false
  return await subscribeCreationChainWithId(chainId, application.applicationId, applicationType, force)
}

defineExpose({
  subscribeCreationChainWithType,
  subscribeCreationChainWithId
})

</script>
