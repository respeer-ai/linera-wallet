<template>
  <div class='row fill-parent' :style='{ padding: "16px 0 8px 0" }'>
    <q-icon
      :name='"img:" + lineraLogo'
      size='24px'
      :style='{ margin: "12px" }'
    />
    <AccountList :show-logo='false' :show-digits='6' label='Linera DevNet' />
    <q-space />
    <div :style='{lineHeight: "48px"}'>
      <q-icon name='stream' size='24px' color='blue-6' class='cursor-pointer' />
    </div>
  </div>
</template>

<script setup lang="ts">
import AccountList from 'src/components/AccountList.vue'
import lineraLogo from 'src/assets/LineraLogo.png'
</script>
