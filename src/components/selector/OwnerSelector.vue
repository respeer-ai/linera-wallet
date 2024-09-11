<template>
  <q-card class='selector-card'>
    <p class='text-center text-bold text-grey-9 selector-title'>
      Select an account
    </p>
    <div class='selector-search'>
      <q-input
        dense
        outlined
        rounded
        v-model='searchText'
      >
        <template #prepend>
          <q-icon name='bi-search' size='16px' />
        </template>
      </q-input>
    </div>
    <q-list class='selector-list'>
      <q-item
        v-for='owner in displayOwners' :key='owner.id' clickable
        :class='[ "selector-item selector-item", owner.selected ? "selector-item-selected" : "" ]'
      >
        <div :class='[ "selector-indicator", owner.selected ? "selector-indicator-selected" : "" ]' />
        <q-avatar color='red-1 selector-margin-x-left'>
          <q-img :src='ownerAvatar(owner)' width='48px' height='48px' />
        </q-avatar>
        <div class='selector-margin-x-left'>
          <div class='text-bold text-grey-9'>
            {{ owner.name }}
          </div>
          <div class='selector-item-endpoint'>
            0x{{ shortid.shortId(owner.address, 5) }}
          </div>
        </div>
        <q-space />
        <div>
          <div class='row'>
            <q-space />
            <span>$</span>
            <strong class='text-grey-9'>{{ ownerBridge?.ownerBalance(owner).toFixed(2) }}</strong>
            <span class='text-grey-6 header-items-margin-x-left'>USD</span>
          </div>
          <div class='row'>
            <span class='text-grey-9 selector-item-currency-sub'>{{ ownerBridge?.ownerBalance(owner).toFixed(4) }}</span>
            <span class='text-grey-6 selector-item-currency-sub header-items-margin-x-left'>TLINERA</span>
          </div>
        </div>
        <div class='selector-margin-x-left'>
          <q-icon name='bi-three-dots-vertical' size='16px' @click='onActionClick(owner)' />
        </div>
      </q-item>
    </q-list>
    <div class='selector-action'>
      <q-btn flat class='btn btn-alt' label='Create or import account' no-caps />
    </div>
  </q-card>
  <OwnerBridge ref='ownerBridge' v-model:owners='owners' />
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'
import { Owner, ownerAvatar } from 'src/model'
import { shortid } from 'src/utils'

import OwnerBridge from '../bridge/OwnerBridge.vue'

const owners = ref([] as Owner[])
const searchText = ref('')

const displayOwners = computed(() => owners.value.filter((el) => el.name.includes(searchText.value) || el.address.includes(searchText.value)))

const ownerBridge = ref<InstanceType<typeof OwnerBridge>>()

const onActionClick = (owner: Owner) => {
  // TODO
  console.log(owner)
}

</script>
