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

const onRun = () => {
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
