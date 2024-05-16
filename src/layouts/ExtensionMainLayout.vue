<template>
  <q-layout id='popup-container'>
    <q-header class='text-white bg-white logo-left'>
      <div class='row justify-between items-center' style='height: 48px;'>
        <div class='col-3'>
          <q-img
            src='~assets/CheCko.png'
            height='24px'
            fit='contain'
            class='logo'
            @click='onLogoClick'
          />
        </div>
        <div class='col-auto'>
          <AccountList />
        </div>
      </div>
    </q-header>
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>
<script setup lang="ts">
import AccountList from 'src/components/AccountList.vue'

import { useRouter } from 'vue-router'
const router = useRouter()
const onLogoClick = () => {
  void router.push('/extension')
}
</script>
<style scoped lang="sass">
.logo-left
  padding-left: 10px
  &:hover
    cursor: pointer
</style>
