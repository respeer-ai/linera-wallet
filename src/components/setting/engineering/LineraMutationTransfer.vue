<template>
  <div>
    <q-btn
      label='Linera transfer' no-caps class='btn full-width' flat
      @click='onRun'
    />
  </div>
</template>

<script setup lang='ts'>
import { TRANSFER } from 'src/graphql'
import Web3 from 'web3'
import { db, rpc } from 'src/model'

const onRun = async () => {
  try {
    const web3 = new Web3(window.linera)

    const accounts = await web3.eth.requestAccounts()
    if (accounts.length === 0) return

    const state = await window.linera?.request({
      method: 'metamask_getProviderState'
    }) as Record<string, string>

    const owner = await db.ownerFromPublicKey(accounts[0])
    console.log(accounts, state, owner)

    const result = await window.linera.request({
      method: 'linera_graphqlMutation',
      params: {
        query: {
          query: TRANSFER.loc?.source?.body,
          variables: {
            chainId: state.chainId.replace('0x', ''),
            recipient: {
              Account: {
                chain_id: state.chainId.replace('0x', ''),
                owner
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
