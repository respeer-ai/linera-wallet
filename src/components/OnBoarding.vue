<template>
  <q-page class='flex justify-center items-center'>
    <div class='text-center'>
      <h5 class='text-brown-8' :style='{fontWeight: 600, margin: "16px"}'>
        Start Web3 Trip on <q-img :src='lineraLogo' width='24px' /> Linera
      </h5>
      <p class='text-brown-6'>
        CheCko is another browser wallet of Linera blockchain.<br>
        It's built with <strong>Microchain as a Service</strong> infrastructure by consecutive Linera hackathon champion <a href='https://respeer.ai'>ResPeer</a>.<br>
        User can use CheCko to store Linera keys in their local storage, just like Metamask.
      </p>
      <div :style='{margin: "64px 0"}'>
        <q-img :src='cheCkoLogo' width='240px' />
      </div>
      <div :style='{width: "100%"}' class='row'>
        <q-space />
        <p class='text-brown-8' :style='{lineHeight: "20px", maxWidth: "800px"}'>
          <q-icon name='security' class='text-green-8' size='20px' />
          CheCko don't connect to any centeralized server. User accounts information in CheCko is stored locally.<br>
          <q-icon name='verified_user' class='text-green-8' size='20px' />
          CheCko use ResPeer MaaS cluster as RPC endpoint in default. Users always able to set RPC endpoint to what they trust.<br>
          <q-icon name='info' class='text-blue-6' size='20px' />
          Users <strong>MUST</strong> backup their accounts carefully. There is no way to recover your assets if user loses password or accounts private keys.
        </p>
        <q-space />
      </div>
      <p class='text-brown-10'>
        By continue you agree with the <a href='#'>Terms of Usage</a> of CheCko and know that<br>
        CheCko cannot recover your password and accounts private key if you lose them.<br>
      </p>
      <div class='row' :style='{width: "100%"}'>
        <q-space />
        <div :style='{width: "400px", margin: "0 0 64px 0"}'>
          <q-btn
            flat
            label='Create New Wallet'
            :style='{width: "100%", borderRadius: "16px", margin: "8px 0 0 0"}'
            class='text-brown-10 bg-red-2'
            @click='onCreateWalletClick'
          />
          <q-btn
            flat
            label='Import Wallet'
            :style='{width: "100%", borderRadius: "16px", margin: "8px 0 0 0", border: "1px solid #ffcdd2"}'
            class='text-brown-10'
            @click='onImportWaletClick'
          />
        </div>
        <q-space />
      </div>
    </div>
  </q-page>
</template>

<script setup lang='ts'>
import { useRouter } from 'vue-router'

import cheCkoLogo from 'src/assets/CheCko.png'
import lineraLogo from 'src/assets/LineraLogo.png'

const router = useRouter()

const onCreateWalletClick = () => {
  void router.push({ path: '/initializewallet' })
}

const onImportWaletClick = () => {
  void router.push({ path: '/importwallet' })
}
</script>
