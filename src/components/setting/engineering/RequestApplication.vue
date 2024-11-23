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
    // const wlinera = await dbNamedApplicationBridge.value?.getNamedApplicationWithType(db.ApplicationType.WLINERA) as db.NamedApplication
    const applicationId = 'c5181ff1b536479e5eb38e4e95716e3fd69dd2a9c15fa9271a09659faf382539bc83233ffc6e696f8cffd4c4780da8e99088306b4544061d555df2c6017df360feeeed172c74027e2675311c4ec3239dbe8e4b4fcf46b12e6f775523a002d64e010000000000000000000000'
    const creationChainId = await lineraWasm.application_creation_chain_id(applicationId)

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
