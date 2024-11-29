<template>
  <div>
    <q-btn
      label='Subscribe creator chain' no-caps class='btn full-width' flat
      @click='onRun'
    />
  </div>
</template>

<script setup lang='ts'>
import { SUBSCRIBE_CREATOR_CHAIN } from 'src/graphql'
import Web3 from 'web3'
import { db } from 'src/model'
import { dbBridge } from 'src/bridge'

const onRun = async () => {
  try {
    const web3 = new Web3(window.linera)

    const accounts = await web3.eth.requestAccounts()
    if (accounts.length === 0) return

    const state = await window.linera?.request({
      method: 'metamask_getProviderState'
    }) as Record<string, string>

    const wlinera = await dbBridge.NamedApplication.namedApplicationWithType(db.ApplicationType.WLINERA) as db.NamedApplication
    const applicationId = wlinera.applicationId

    const owner = await db.ownerFromPublicKey(accounts[0])
    console.log(accounts, state, owner)

    const result = await window.linera.request({
      method: 'linera_graphqlMutation',
      params: {
        applicationId,
        query: {
          query: SUBSCRIBE_CREATOR_CHAIN.loc?.source?.body,
          variables: {}
        },
        operationName: 'subscribeCreatorChain'
      }
    })
    console.log(result)
  } catch (e) {
    console.log('Fail run mutation', e)
  }
}

</script>
