<template>
  <div class='text-center'>
    <div class='vertical-items-margin slogan'>
      {{ $t('MSG_DEDICATED_LINERA_MICROCHAIN_WALLET') }}
    </div>
    <div class='vertical-sections-margin extra-margin-bottom'>
      <q-img :src='cheCkoLogo' width='360px' />
    </div>
    <div class='text-left row'>
      <q-space />
      <div class='extra-large-margin-bottom software-info'>
        <div class='row line decorate-underline-dashed'>
          <div class='label'>
            {{ $t('MSG_VERSION') }}
          </div>
          <q-space />
          <div>{{ $t('MSG_VERSION_NUMBER') }}</div>
        </div>
        <div class='row line'>
          <div class='label'>
            {{ $t('MSG_BUILT_BY') }}
          </div>
          <q-space />
          <div><a href='https://respeer.ai'>respeer.ai</a></div>
        </div>
        <div class='row line'>
          <div class='label'>
            {{ $t('MSG_SUPPORT') }}
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
    .label
      color: $grey-8

.slogan
  font-size: 16px
  color: $grey-9
</style>
