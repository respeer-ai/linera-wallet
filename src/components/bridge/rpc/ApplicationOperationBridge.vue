<template>
  <DbNetworkBridge ref='dbNetworkBridge' />
  <DbApplicationCreatorChainSubscriptionBridge ref='dbApplicationCreatorChainSubscriptionBridge' />
  <DbChainOperationBridge ref='dbChainOperationBridge' />
</template>
<script setup lang='ts'>
import { DocumentNode } from 'graphql'
import { rpc, db } from 'src/model'
import { ref } from 'vue'
import axios from 'axios'
import { graphqlResult } from 'src/utils'
import { SUBSCRIBE_CREATOR_CHAIN, LEGACY_REQUEST_SUBSCRIBE } from 'src/graphql'
import { uid } from 'quasar'

import DbNetworkBridge from '../db/NetworkBridge.vue'
import DbApplicationCreatorChainSubscriptionBridge from '../db/ApplicationCreatorChainSubscriptionBridge.vue'
import DbChainOperationBridge from '../db/ChainOperationBridge.vue'

const dbNetworkBridge = ref<InstanceType<typeof DbNetworkBridge>>()
const dbApplicationCreatorChainSubscriptionBridge = ref<InstanceType<typeof DbApplicationCreatorChainSubscriptionBridge>>()
const dbChainOperationBridge = ref<InstanceType<typeof DbChainOperationBridge>>()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const queryApplication = async (chainId: string, applicationId: string, query: DocumentNode, operationName: string, variables?: Record<string, unknown>): Promise<Uint8Array | undefined> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const network = await dbNetworkBridge.value?._selectedNetwork() as db.Network
  if (!network) return

  // TODO: we can serialize locally

  variables = variables || {}
  variables.checko_query_only = true

  const applicationUrl = `http://${network?.host}:${network?.port}/chains/${chainId}/applications/${applicationId}`
  return new Promise((resolve, reject) => {
    axios.post(applicationUrl, {
      query: query.loc?.source.body,
      variables,
      operationName
    }).then((res) => {
      const data = graphqlResult.data(res, 'data')
      const bytes = graphqlResult.keyValue(data, operationName) as Uint8Array
      resolve(bytes)
    }).catch((e) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      console.log(`Failed query application: ${e}`)
      reject(e)
    })
  })
}

const subscribeCreatorChain = async (chainId: string, applicationId: string, applicationType: db.ApplicationType, force?: boolean): Promise<boolean> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  if (!force && await dbApplicationCreatorChainSubscriptionBridge.value?.applicationCreatorChainSubscribed(chainId, applicationId)) return true

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  if (await dbChainOperationBridge.value?.existChainOperation(chainId, db.OperationType.SUBSCRIBE_CREATOR_CHAIN, applicationId))
    return true

  try {
    const queryRespBytes = await queryApplication(chainId, applicationId, SUBSCRIBE_CREATOR_CHAIN, 'subscribeCreatorChain')
    const operation = {
      operationType: db.OperationType.SUBSCRIBE_CREATOR_CHAIN,
      operationId: uid(),
      microchain: chainId,
      applicationId,
      applicationType,
      operation: JSON.stringify({
        User: {
          application_id: applicationId,
          bytes: queryRespBytes
        }
      } as rpc.Operation),
      graphqlQuery: SUBSCRIBE_CREATOR_CHAIN.loc?.source?.body
    } as db.ChainOperation
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await dbChainOperationBridge.value?.createChainOperation({ ...operation })
    return true
  } catch {
    return false
  }
}

const requestSubscribe = async (chainId: string, applicationId: string) => {
  const queryRespBytes = await queryApplication(chainId, applicationId, LEGACY_REQUEST_SUBSCRIBE, 'requestSubscribe')

  const operation = {
    operationType: db.OperationType.LEGACY_REQUEST_SUBSCRIBE,
    operationId: uid(),
    microchain: chainId,
    applicationId,
    applicationType: db.ApplicationType.ANONYMOUS,
    operation: JSON.stringify({
      User: {
        application_id: applicationId,
        bytes: queryRespBytes || []
      }
    } as rpc.Operation),
    graphqlQuery: LEGACY_REQUEST_SUBSCRIBE.loc?.source?.body
  } as db.ChainOperation
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await dbChainOperationBridge.value?.createChainOperation({ ...operation })
}

defineExpose({
  queryApplication,
  subscribeCreatorChain,
  requestSubscribe
})

</script>
