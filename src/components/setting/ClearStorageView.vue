<template>
  <div>
    <div class='tip info-bg text-left'>
      <div class='page-x-padding'>
        You should understand when you click this button, it will clear all of the data in your storage including the wallet configuration and accounts data!
      </div>
    </div>
    <q-btn
      :loading='confirmedSeconds > 0 && confirmedSeconds < confirmSeconds'
      :percentage='confirmedSeconds * 100 / confirmSeconds'
      flat dense class='btn btn-alt vertical-menus-margin full-width' label='Clear storage'
      no-caps
      v-touch-repeat.mouse='onConfirmClick'
      @mouseup='onConfirmCanceled'
    >
      <template #loading>
        <q-spinner-gears class='on-left' />
        Confirming
      </template>
    </q-btn>
  </div>
</template>

<script setup lang='ts'>
import { dbWallet } from 'src/controller'
import { ref } from 'vue'

const confirmSeconds = ref(10)
const confirmedSeconds = ref(0)

const onConfirmClick = async () => {
  confirmedSeconds.value++
  if (confirmSeconds.value === confirmedSeconds.value) {
    await dbWallet.microchains.clear()
    await dbWallet.microchainFungibleTokenBalances.clear()
    await dbWallet.microchainOwnerFungibleTokenBalances.clear()
    await dbWallet.microchainOwners.clear()
  }
}

const onConfirmCanceled = () => {
  confirmedSeconds.value = 0
}

</script>
