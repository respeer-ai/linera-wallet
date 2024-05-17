<template>
  <q-page class='flex justify-center items-center'>
    <div class='text-center'>
      <h5 class='text-brown-8' :style='{fontWeight: 600, margin: "8px"}'>
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
      <p class='text-brown-6'>
        By continue you agree with the <a href='#'>Terms of Usage</a> of CheCko.
      </p>
      <div class='row' :style='{width: "100%"}'>
        <q-space />
        <div :style='{width: "400px", margin: "0 0 64px 0"}'>
          <q-btn
            flat
            label='Create New Wallet'
            :style='{width: "100%", borderRadius: "16px", margin: "8px 0 0 0"}'
            class='text-brown-10 bg-red-2'
          />
          <q-btn
            flat
            label='Import Wallet'
            :style='{width: "100%", borderRadius: "16px", margin: "8px 0 0 0", border: "1px solid #ffcdd2"}'
            class='text-brown-10'
          />
        </div>
        <q-space />
      </div>
    </div>
  </q-page>
</template>

<script setup lang='ts'>
import cheCkoLogo from 'src/assets/CheCko.png'
import lineraLogo from 'src/assets/LineraLogo.png'
</script>
