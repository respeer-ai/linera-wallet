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
import { rpc } from 'src/model'

const onRun = async () => {
  try {
    const web3 = new Web3(window.linera)

    const accounts = await web3.eth.requestAccounts()
    if (accounts.length === 0) return

    const state = await window.linera?.request({
      method: 'metamask_getProviderState'
    }) as Record<string, string>

    const result = await window.linera.request({
      method: 'linera_graphqlMutation',
      params: {
        query: {
          query: TRANSFER.loc?.source?.body,
          variables: {
            owner: accounts[0],
            recipient: {
              Account: {
                chain_id: state.chainId,
                owner: accounts[0]
              }
            } as rpc.Recipient,
            amount: '0.01'
          }
        },
        operationName: 'transfer'
      }
    })
    console.log(result)
  } catch (e) {
    console.log('Fail run mutation', e)
  }
}

</script>
