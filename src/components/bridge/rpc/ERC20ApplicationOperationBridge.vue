<template>
  <MonoApplicationOperationBridge ref='monoApplicationOperationBridge' />
  <RpcOperationBridge ref='rpcOperationBridge' />
</template>
<script setup lang='ts'>
import { db } from 'src/model'
import { ref } from 'vue'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { TOKEN_METADATA } from 'src/graphql'
import { graphqlResult } from 'src/utils'

import MonoApplicationOperationBridge from './MonoApplicationOperationBridge.vue'
import RpcOperationBridge from './OperationBridge.vue'

const monoApplicationOperationBridge = ref<InstanceType<typeof MonoApplicationOperationBridge>>()
const rpcOperationBridge = ref<InstanceType<typeof RpcOperationBridge>>()

const subscribeWLineraCreationChain = async (chainId: string, force?: boolean): Promise<boolean> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return await monoApplicationOperationBridge.value?.subscribeCreationChainWithType(chainId, db.ApplicationType.WLINERA, force) || false
}

const subscribeCreationChain = async (chainId: string, applicationId: string, force?: boolean): Promise<boolean> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
  return await monoApplicationOperationBridge.value?.subscribeCreationChainWithId(chainId, applicationId, db.ApplicationType.ERC20, force) || false
}

const requestApplication = (chainId: string, applicationId: string, creationChainId: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  rpcOperationBridge.value?.requestApplication(chainId, applicationId, creationChainId, db.ApplicationType.ERC20)
}

const persistApplication = async (chainId: string, applicationId: string) => {
  // TODO: check if we already persist application
  // TODO: subscribe application
  // TODO: query token info
  const options = await getClientOptionsWithEndpointType(EndpointType.Application, chainId, applicationId)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(TOKEN_METADATA, {
    // NO PARAMETER
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      const tokenMetadata = graphqlResult.data(res, 'tokenMetadata')
      console.log(tokenMetadata)
      // resolve((graphqlResult.rootData(res) as GetChainAccountBalancesQuery).balances as rpc.ChainAccountBalances)
      resolve(undefined)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(new Error(`Query token metadata: ${error}`))
    })
  })

  // TODO: create token
  // TODO: check balance
}

defineExpose({
  subscribeWLineraCreationChain,
  subscribeCreationChain,
  requestApplication,
  persistApplication
})

</script>
