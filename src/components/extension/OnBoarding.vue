<template>
  <div class='text-center'>
    <h5 class='text-brown-8' :style='{fontWeight: 600}'>
      Start Web3 Trip on <q-img :src='lineraLogo' width='24px' /> Linera
    </h5>
    <div :style='{margin: "64px 0"}'>
      <q-img :src='cheCkoLogo' width='240px' />
    </div>
    <div class='row' :style='{width: "100%"}'>
      <q-space />
      <div :style='{width: "100%", margin: "0 0 64px 0"}'>
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
    <div class='row'>
      <q-space />
      <a href='#' :style='{margin: "0 8px 0 0"}'>Terms of Usage</a>
      <a href='#'>Privacy Policy</a>
      <q-space />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { useRouter } from 'vue-router'
import { oneshotsetting } from 'src/localstores'
import { computed } from 'vue'

import cheCkoLogo from 'src/assets/CheCko.png'
import lineraLogo from 'src/assets/LineraLogo.png'

const setting = oneshotsetting.useSettingStore()
const extensionMode = computed(() => setting.extensionMode)

const router = useRouter()

const onCreateWalletClick = () => {
  void router.push({ path: extensionMode.value ? '/extension/initializewallet' : '/initializewallet' })
}

const onImportWaletClick = () => {
  void router.push({ path: extensionMode.value ? '/extension/importwallet' : '/importwallet' })
}
</script>
