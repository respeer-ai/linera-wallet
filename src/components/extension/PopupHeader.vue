<template>
  <div class='row full-width'>
    <q-img :src='connection?.favicon' width='36px' height='36px' />
    <div :style='{marginLeft: "16px"}'>
      <div class='text-bold'>
        {{ connection?.name }}
      </div>
      <div class='text-blue-6'>
        {{ connection?.origin }}
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { localStore } from 'src/localstores'
import { computed } from 'vue'

const connection = computed(() => localStore.popup.currentConnection)

</script>
