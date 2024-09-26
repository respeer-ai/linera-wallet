<template>
  <div class='text-center full-width page-y-padding'>
    <AccountsInnerView :searchable='false' :show-action='false' :persistent='false' v-model='owner' />
  </div>
</template>

<script setup lang='ts'>
import { db } from 'src/model'

import AccountsInnerView from '../../account/AccountsInnerView.vue'

const owner = defineModel<db.Owner>()

</script>
