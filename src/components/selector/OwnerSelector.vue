<template>
  <q-card class='network-selector-card'>
    <p class='text-center text-bold text-grey-9 network-selector-title'>
      Select an account
    </p>
    <q-list class='network-selector-list'>
      <q-item
        v-for='owner in owners' :key='owner.id' clickable
        :class='[ "network-selector-item selector-item", owner.selected ? "selector-item-selected" : "" ]'
      >
        <div :class='[ "selector-indicator", owner.selected ? "selector-indicator-selected" : "" ]' />
        <q-avatar color='red-1 selector-margin-x-left'>
          <q-img :src='ownerAvatar(owner)' width='48px' height='48px' />
        </q-avatar>
        <div class='selector-margin-x-left'>
          <div class='text-bold text-grey-9'>
            {{ owner.name }}
          </div>
          <div class='network-selector-item-endpoint'>
            0x{{ shortid.shortId(owner.address, 4) }}
          </div>
        </div>
        <q-space />
        <div>
          <q-icon name='bi-three-dots-vertical' size='16px' @click='onActionClick(owner)' />
        </div>
      </q-item>
    </q-list>
    <div class='network-selector-action'>
      <q-btn flat class='btn btn-alt' label='Add or import account' no-caps />
    </div>
  </q-card>
  <OwnerBridge ref='ownerBridge' v-model:owners='owners' />
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { Owner, ownerAvatar } from 'src/model'
import { shortid } from 'src/utils'

import OwnerBridge from '../bridge/OwnerBridge.vue'

const owners = ref([] as Owner[])

const ownerBridge = ref<InstanceType<typeof OwnerBridge>>()

const onActionClick = (owner: Owner) => {
  // TODO
  console.log(owner)
}

</script>
