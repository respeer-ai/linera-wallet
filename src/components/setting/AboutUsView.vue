<template>
  <div class='text-center'>
    <div class='vertical-sections-margin text-grey-8'>
      Dedicated Linera microchain wallet.
    </div>
    <div class='vertical-sections-margin extra-margin-bottom'>
      <q-img :src='cheCkoLogo' width='360px' />
    </div>
    <div class='text-left row'>
      <q-space />
      <div class='extra-large-margin-bottom'>
        <div>
          Version: 0.0.1
        </div>
        <div>
          Built by: <a href='https://respeer.ai'>respeer.ai</a>
        </div>
      </div>
      <q-space />
    </div>
  </div>
</template>

<script setup lang='ts'>

import { cheCkoLogo } from 'src/assets'

</script>
