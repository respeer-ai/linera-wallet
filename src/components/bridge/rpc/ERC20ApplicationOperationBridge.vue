<template>
  <MonoApplicationOperationBridge ref='monoApplicationOperationBridge' />
  <RpcOperationBridge ref='rpcOperationBridge' />
  <DbTokenBridge ref='dbTokenBridge' />
  <RpcApplicationOperationBridge ref='rpcApplicationOperationBridge' />
</template>
<script setup lang='ts'>
import { db, rpc } from 'src/model'
import { ref } from 'vue'
import { ApolloClient } from '@apollo/client/core'
import { provideApolloClient, useQuery } from '@vue/apollo-composable'
import { EndpointType, getClientOptionsWithEndpointType } from 'src/apollo'
import { BALANCE_OF, MINT, TOKEN_METADATA, TRANSFER_ERC20 } from 'src/graphql'
import { graphqlResult } from 'src/utils'
import { localStore, operationDef } from 'src/localstores'
import { uid } from 'quasar'

import MonoApplicationOperationBridge from './MonoApplicationOperationBridge.vue'
import RpcOperationBridge from './OperationBridge.vue'
import DbTokenBridge from '../db/TokenBridge.vue'
import RpcApplicationOperationBridge from './ApplicationOperationBridge.vue'

const monoApplicationOperationBridge = ref<InstanceType<typeof MonoApplicationOperationBridge>>()
const rpcOperationBridge = ref<InstanceType<typeof RpcOperationBridge>>()
const dbTokenBridge = ref<InstanceType<typeof DbTokenBridge>>()
const rpcApplicationOperationBridge = ref<InstanceType<typeof RpcApplicationOperationBridge>>()

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
      github: token.tokenMetadata.github,
      mintable: token.tokenMetadata.mintable
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
}

const balanceOf = async (chainId: string, applicationId: string, publicKey?: string): Promise<number> => {
  const chainAccountOwner = {
    chain_id: chainId
  } as rpc.ChainAccountOwner
  if (publicKey) {
    const owner = await db.ownerFromPublicKey(publicKey)
    chainAccountOwner.owner = `User:${owner}`
  }
  const options = await getClientOptionsWithEndpointType(EndpointType.Application, chainId, applicationId)
  const apolloClient = new ApolloClient(options)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const { /* result, refetch, fetchMore, */ onResult, onError } = provideApolloClient(apolloClient)(() => useQuery(BALANCE_OF, {
    owner: chainAccountOwner
  }, {
    fetchPolicy: 'network-only'
  }))

  return new Promise((resolve, reject) => {
    onResult((res) => {
      const balance = Number(graphqlResult.data(res, 'balanceOf'))
      resolve(balance)
    })

    onError((error) => {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      reject(`Query token metadata: ${error}`)
    })
  })
}

const mint = async (chainId: string, applicationId: string, to: rpc.ChainAccountOwner | undefined, amount: number) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const queryRespBytes = await rpcApplicationOperationBridge.value?.queryApplication(chainId, applicationId, MINT, 'mint', {
      to,
      amount: amount.toString()
    })
    localStore.operation.operations.push({
      operationType: operationDef.OperationType.MINT,
      applicationType: db.ApplicationType.ERC20,
      operationId: uid(),
      microchain: chainId,
      operation: {
        User: {
          application_id: applicationId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          bytes: queryRespBytes
        }
      } as rpc.Operation
    } as operationDef.ChainOperation)
    return true
  } catch {
    return false
  }
}

const transfer = async (chainId: string, applicationId: string, to: rpc.ChainAccountOwner | undefined, amount: number) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const queryRespBytes = await rpcApplicationOperationBridge.value?.queryApplication(chainId, applicationId, TRANSFER_ERC20, 'transfer', {
      to,
      amount: amount.toString()
    })

    localStore.operation.operations.push({
      operationType: operationDef.OperationType.MINT,
      applicationType: db.ApplicationType.ERC20,
      operationId: uid(),
      microchain: chainId,
      operation: {
        User: {
          application_id: applicationId,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          bytes: queryRespBytes
        }
      } as rpc.Operation
    } as operationDef.ChainOperation)
    return true
  } catch (e) {
    console.log('Error', e)
    return false
  }
}

defineExpose({
  subscribeWLineraCreationChain,
  subscribeCreationChain,
  requestApplication,
  persistApplication,
  balanceOf,
  mint,
  transfer
})

</script>
