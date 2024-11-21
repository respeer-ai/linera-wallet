<template>
  <div>
    <q-btn
      label='Request application' no-caps class='btn full-width' flat
      @click='onRun'
    />
    <DbNamedApplicationBridge ref='dbNamedApplicationBridge' />
  </div>
</template>

<script setup lang='ts'>
import { REQUEST_APPLICATION } from 'src/graphql'
import Web3 from 'web3'
import { db } from 'src/model'
import { ref } from 'vue'
import * as lineraWasm from '../../../../src-bex/wasm/linera_wasm'

import DbNamedApplicationBridge from '../../bridge/db/NamedApplicationBridge.vue'

const dbNamedApplicationBridge = ref<InstanceType<typeof DbNamedApplicationBridge>>()

const onRun = async () => {
  try {
    const web3 = new Web3(window.linera)

    const accounts = await web3.eth.requestAccounts()
    if (accounts.length === 0) return

    const state = await window.linera?.request({
      method: 'metamask_getProviderState'
    }) as Record<string, string>

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const wlinera = await dbNamedApplicationBridge.value?.getNamedApplicationWithType(db.ApplicationType.WLINERA) as db.NamedApplication
    const creationChainId = await lineraWasm.application_creation_chain_id(wlinera.applicationId)
    const applicationId = wlinera.applicationId

    const owner = await db.ownerFromPublicKey(accounts[0])
    console.log(accounts, state, owner)

    const result = await window.linera.request({
      method: 'linera_graphqlMutation',
      params: {
        query: {
          query: REQUEST_APPLICATION.loc?.source?.body,
          variables: {
            chainId: creationChainId,
            applicationId
          }
        },
        operationName: 'requestApplication'
      }
    })
    console.log(result)
  } catch (e) {
    console.log('Fail run mutation', e)
  }
}

</script>
