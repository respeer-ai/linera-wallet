<template>
  <div>
    <q-btn
      label='Sign content' no-caps class='btn full-width' flat
      @click='onRun'
    />
  </div>
</template>

<script setup lang='ts'>
import Web3 from 'web3'

const onRun = async () => {
  const web3 = new Web3(window.linera)

  const accounts = await web3.eth.requestAccounts()
  if (!accounts.length) return console.log('Invalid account')

  const hexContent = Web3.utils.utf8ToHex('Hello World!')
  console.log('Sign', hexContent, accounts)

  web3.eth.sign(hexContent, '0x' + accounts[0].slice(0, 40))
    .then((result) => {
      console.log(result)
    }).catch((e) => {
      console.log('eth_sign', e)
    })
}

</script>
