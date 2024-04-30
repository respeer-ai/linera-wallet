<template>
  <div class='row'>
    <q-img
      src='~assets/CheCko.png'
      height='24px'
      width='160px'
      fit='contain'
      :style='{margin: "12px 6px"}'
    />
    <q-space />
    <AccountList />
  </div>
</template>

<script setup lang='ts'>

import AccountList from 'src/components/AccountList.vue'

</script>
