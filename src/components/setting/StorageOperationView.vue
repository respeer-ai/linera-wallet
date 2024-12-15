<template>
  <div :class='[ "row text-center vertical-sections-margin extra-large-margin-bottom", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
    <div class='row full-width' v-if='localStore.setting.extensionMode'>
      <q-space />
      <q-img
        :src='storageIcon' width='120px' class='selector-margin-x-left'
        fit='contain'
      />
      <q-space />
    </div>
    <div v-if='!confirmed' :class='[ localStore.setting.extensionMode ? "vertical-sections-margin" : "row" ]'>
      <div :style='{width: localStore.setting.extensionMode ? "100%" : "calc(100% - 132px)"}' class='text-left'>
        <div class='vertical-items-margin tip warn-bg warn row'>
          <q-icon name='bi-exclamation-triangle-fill' color='red-8' size='24px' />
          <div class='tip-text page-item-x-margin-left'>
            {{ $t('MSG_SUGGEST_DONT_TOUCH_THIS_MENU') }}
          </div>
        </div>
        <q-btn
          flat :class='[ "btn btn-alt vertical-menus-margin text-black", localStore.setting.extensionMode ? "full-width" : "" ]' no-caps
          @click='confirmed = true'
        >
          {{ $t('MSG_I_UNDERSTAND') }}
        </q-btn>
      </div>
      <q-img
        v-if='!localStore.setting.extensionMode' :src='storageIcon' width='120px' class='selector-margin-x-left'
        fit='contain'
      />
    </div>
    <div v-else :class='[ localStore.setting.extensionMode ? "vertical-sections-margin" : "" ]'>
      <ClearStorageView />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { localStore } from 'src/localstores'

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
