<template>
  <div class='fill-parent footer-menu'>
    <q-tabs
      v-model='tab'
      narrow-indicator
      dense
    >
      <q-tab name='home' :style='{fontSize: "12px"}' :class='[ "text-bold", tab === "home" ? "text-brown-8" : "text-brown-6" ]'>
        Home
      </q-tab>
      <q-tab name='microchain' :style='{fontSize: "12px"}' :class='[ "text-bold", tab === "microchain" ? "text-brown-8" : "text-brown-6" ]'>
        Microchains
      </q-tab>
      <q-tab name='activity' :style='{fontSize: "12px"}' :class='[ "text-bold", tab === "activity" ? "text-brown-8" : "text-brown-6" ]'>
        Activity
      </q-tab>
      <q-tab name='setting' :style='{fontSize: "12px"}' :class='[ "text-bold", tab === "setting" ? "text-brown-8" : "text-brown-6" ]'>
        Setting
      </q-tab>
    </q-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const tab = ref('home')
</script>
