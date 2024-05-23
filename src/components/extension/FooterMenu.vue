<template>
  <div class='fill-parent footer-menu'>
    <q-tabs
      v-model='tab'
      narrow-indicator
      dense
    >
      <q-route-tab
        name='home'
        :style='{fontSize: "12px"}'
        :class='[ "text-bold", tab === "home" ? "text-brown-8" : "text-brown-6" ]'
        to='/extension/accountinfo'
        exact
      >
        Home
      </q-route-tab>
      <q-route-tab
        name='microchain'
        :style='{fontSize: "12px"}'
        :class='[ "text-bold", tab === "microchain" ? "text-brown-8" : "text-brown-6" ]'
        to='/extension/microchains'
        exact
      >
        Microchain
      </q-route-tab>
      <q-route-tab
        name='activity'
        :style='{fontSize: "12px"}'
        :class='[ "text-bold", tab === "activity" ? "text-brown-8" : "text-brown-6" ]'
        to='/extension/activity'
        exact
      >
        Activity
      </q-route-tab>
      <q-route-tab
        name='setting'
        :style='{fontSize: "12px"}'
        :class='[ "text-bold", tab === "setting" ? "text-brown-8" : "text-brown-6" ]'
        to='/extension/setting'
        exact
      >
        Setting
      </q-route-tab>
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tab = ref('home')
</script>
