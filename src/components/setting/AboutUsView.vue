<template>
  <div class='text-center'>
    <div class='vertical-items-margin slogan'>
      Dedicated Linera microchain wallet.
    </div>
    <div class='vertical-sections-margin extra-margin-bottom'>
      <q-img :src='cheCkoLogo' width='360px' />
    </div>
    <div class='text-left row'>
      <q-space />
      <div class='extra-large-margin-bottom software-info'>
        <div class='row line'>
          <div class='label'>
            Version
          </div>
          <q-space />
          <div>0.0.1</div>
        </div>
        <div class='row line'>
          <div class='label'>
            Built by
          </div>
          <q-space />
          <div><a href='https://respeer.ai'>respeer.ai</a></div>
        </div>
        <div class='row line'>
          <div class='label'>
            Support
          </div>
          <q-space />
          <div>checko@respeer.ai</div>
        </div>
      </div>
      <q-space />
    </div>
  </div>
</template>

<script setup lang='ts'>

import { cheCkoLogo } from 'src/assets'

</script>

<style scope lang='sass'>
.software-info
  max-width: 40%
  min-width: 280px
  .line
    line-height: 28px
    border-bottom: 1px dashed $grey-4
    .label
      color: $grey-8

.slogan
  font-size: 16px
  color: $grey-9
</style>
