<template>
  <DbNetworkBridge ref='dbNetworkBridge' />
</template>
<script setup lang='ts'>
import { DocumentNode } from 'graphql'
import { localStore, operationDef } from 'src/localstores'
import { db, rpc } from 'src/model'
import { ref } from 'vue'
import axios from 'axios'
// import { graphqlResult } from 'src/utils'
import { SUBSCRIBE_CREATION_CHAIN } from 'src/graphql'

import DbNetworkBridge from '../db/NetworkBridge.vue'

const dbNetworkBridge = ref<InstanceType<typeof DbNetworkBridge>>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const queryApplication = async (chainId: string, applicationId: string, query: DocumentNode): Promise<Int8Array | undefined> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const network = await dbNetworkBridge.value?._selectedNetwork() as db.Network
  if (!network) return

  const applicationUrl = `http://${network?.host}:${network?.port}/chains/${chainId}/applications/${applicationId}`
  axios.post(applicationUrl).then((res) => {
    console.log(res)
  }).catch((e) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Failed query application: ${e}`)
  })
}

const subscribeCreatorChain = async (chainId: string, applicationId: string) => {
  const queryRespBytes = await queryApplication(chainId, applicationId, SUBSCRIBE_CREATION_CHAIN)

  localStore.operation.operations.push({
    microchain: chainId,
    operation: {
      User: {
        application_id: applicationId,
        bytes: queryRespBytes
      }
    } as rpc.Operation
  } as operationDef.ChainOperation)
}

defineExpose({
  queryApplication,
  subscribeCreatorChain
})

</script>
