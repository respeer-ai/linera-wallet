<template>
  <div class='row text-center vertical-sections-margin extra-large-margin-bottom'>
    <div v-if='!confirmed' class='row'>
      <div :style='{width: "calc(100% - 132px)"}' class='text-left'>
        <div class='vertical-items-margin tip warn-bg warn row'>
          <q-icon name='bi-exclamation-triangle-fill' color='red-8' size='24px' />
          <div class='tip-text page-item-x-margin-left'>
            I suggest you don't access this menu unless you know what you will do.
          </div>
        </div>
        <q-btn
          flat class='btn btn-alt vertical-menus-margin text-black' no-caps
          @click='confirmed = true'
        >
          I understand
        </q-btn>
      </div>
      <q-img :src='storageIcon' width='120px' class='selector-margin-x-left' fit='contain' />
    </div>
    <div v-else>
      <ClearStorageView />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

import ClearStorageView from './ClearStorageView.vue'

import { storageIcon } from 'src/assets'

const confirmed = ref(false)

</script>

<style scope lang='sass'>
.software-info
  max-width: 40%
  min-width: 280px
  .line
    line-height: 28px
    .label
      color: $grey-8

.slogan
  font-size: 16px
  color: $grey-9
</style>
