<template>
  <div>
    <q-btn
      label='Request accounts' no-caps class='btn full-width' flat
      @click='onRun'
    />
  </div>
</template>

<script setup lang='ts'>
import Web3 from 'web3'

const onRun = () => {
  const web3 = new Web3(window.linera)
  web3.eth.requestAccounts().then((accounts) => {
    console.log(accounts)
  }).catch((error) => {
    console.log(error)
  })
}

</script>
