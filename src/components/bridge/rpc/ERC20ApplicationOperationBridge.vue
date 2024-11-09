<template>
  <MonoApplicationOperationBridge ref='monoApplicationOperationBridge' />
  <RpcOperationBridge ref='rpcOperationBridge' />
  <DbTokenBridge ref='dbTokenBridge' />
</template>
<script setup lang='ts'>
import { db, rpc } from 'src/model'
import { ref } from 'vue'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { TOKEN_METADATA } from 'src/graphql'
import { graphqlResult } from 'src/utils'
import { localStore } from 'src/localstores'
import { uid } from 'quasar'

import MonoApplicationOperationBridge from './MonoApplicationOperationBridge.vue'
import RpcOperationBridge from './OperationBridge.vue'
import DbTokenBridge from '../db/TokenBridge.vue'

const monoApplicationOperationBridge = ref<InstanceType<typeof MonoApplicationOperationBridge>>()
const rpcOperationBridge = ref<InstanceType<typeof RpcOperationBridge>>()
const dbTokenBridge = ref<InstanceType<typeof DbTokenBridge>>()

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
  const options = await getClientOptionsWithEndpointType(EndpointType.Application, chainId, applicationId)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(TOKEN_METADATA, {
    // NO PARAMETER
  }, {
    fetchPolicy: 'network-only'
  }))

  onResult((res) => {
    const token = graphqlResult.rootData(res) as rpc.ERC20Token
    if (!token.tokenMetadata) {
    // Add to ticker run let block subscription run it
      return localStore.operation.tickerRuns.set(uid(), () => {
        void persistApplication(chainId, applicationId)
      })
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    void dbTokenBridge.value?.createToken({
      name: token.name,
      description: token.tokenMetadata.description,
      totalSupply: Number(token.totalSupply),
      ticker: token.symbol,
      tokenType: db.TokenType.Fungible,
      logo: token.tokenMetadata.logo,
      applicationId,
      native: false,
      usdCurrency: 0,
      mono: true,
      discord: token.tokenMetadata.discord,
      telegram: token.tokenMetadata.telegram,
      twitter: token.tokenMetadata.twitter,
      website: token.tokenMetadata.website,
      github: token.tokenMetadata.github
    })
  })

  onError((error) => {
  // Add to ticker run let block subscription run it
    localStore.operation.tickerRuns.set(uid(), () => {
      void persistApplication(chainId, applicationId)
    })
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Query token metadata: ${error}`)
  })
  // TODO: check balance
}

defineExpose({
  subscribeWLineraCreationChain,
  subscribeCreationChain,
  requestApplication,
  persistApplication
})

</script>
