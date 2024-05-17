<template>
  <q-page class='flex justify-center items-center'>
    <div :style='{margin: "0 0 160px 0"}'>
      <InitializeWallet />
    </div>
  </q-page>
</template>

<script setup lang='ts'>
import InitializeWallet from 'src/components/InitializeWallet.vue'
</script>
