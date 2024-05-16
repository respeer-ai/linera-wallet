<template>
  <q-page-sticky position='bottom-right' :offset='[18, 18]'>
    <q-btn
      rounded
      :label='show ? "DISMISS" : "CHECKO MUST READ"'
      class='bg-red-1 text-brown-10'
      :style='{ width: "180px" }'
    >
      <q-popup-proxy v-model='show'>
        <div
          class='bg-grey-4 text-brown-10'
          :style='{ padding: "24px", maxWidth: "640px" }'
        >
          <p><strong>MUST READ</strong></p>
          CheCko is run with Linera DevNet currently. Token symbol
          <strong>TLINERA</strong> used in CheCko is only a placeholder to show
          the functionalities of Linera wallet work-flows. CheCko won"t DM
          anyone to get money for any reason. And, CheCko is only a third-party
          open source wallet solution for Linera devloped by consecutive Linera
          hackathon winner <a href='https://respeer.ai'>ResPeer</a>"s
          <strong>Microchain as a Service</strong> architecture. Community
          members should not think of CheCko is official Linera wallet. Official
          team will release browser wallet which integrates microchain to
          browser extension soon.
        </div>
      </q-popup-proxy>
    </q-btn>
  </q-page-sticky>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const show = ref(true)
</script>
