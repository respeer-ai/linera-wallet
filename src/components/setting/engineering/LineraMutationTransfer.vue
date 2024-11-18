<template>
  <div>
    <q-btn
      label='Linera Transfer' no-caps class='btn full-width' flat
      @click='onRun'
    />
  </div>
</template>

<script setup lang='ts'>
import { TRANSFER } from 'src/graphql'
import Web3 from 'web3'
import * as lineraWasm from '../../../../src-bex/wasm/linera_wasm'
import { rpc } from 'src/model'

const onRun = async () => {
  const variables = {
    recipient: {
      Account: {
        chain_id: 'e0069858779520ab2d968462367ceca540dfbd6b209590e3316c0c7605735903'
      }
    } as rpc.Recipient,
    amount: '12.6'
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion
  const request = await lineraWasm.graphql_deserialize_operation(TRANSFER.loc?.source?.body as string, JSON.stringify(variables)) as string
  const operation = JSON.parse(request) as rpc.Operation
  console.log(operation, TRANSFER.loc?.source?.body)

  const web3 = new Web3(window.linera)
  web3.eth.requestAccounts().then((accounts) => {
    console.log('Request accounts', accounts)
    window.linera.request({
      method: 'linera_graphqlMutation',
      params: {
        query: {
          query: TRANSFER.loc?.source?.body,
          variables: {}
        },
        operationName: 'transfer'
      }
    }).then((result) => {
      console.log(result)
    }).catch((error) => {
      console.log(error)
    })
  }).catch((error) => {
    console.log('Request accounts', error)
  })
}

</script>
