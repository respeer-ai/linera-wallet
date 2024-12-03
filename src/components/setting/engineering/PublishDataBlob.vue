<template>
  <div>
    <q-btn
      label='Publish data blob' no-caps class='btn full-width' flat
      @click='onRun'
    />
  </div>
</template>

<script setup lang='ts'>
import Web3 from 'web3'
import { db } from 'src/model'

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
      method: 'linera_graphqlPublishDataBlob',
      params: {
        query: {
          variables: {
            chainId: state.chainId.replace('0x', ''),
            bytes: [12, 12, 12, 12, 12, 12, 12, 12]
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
