<template>
  <div>
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
        v-for='_owner in displayOwners' :key='_owner.id' clickable
        :class='[ "selector-item selector-item", _owner.selected ? "selector-item-selected" : "" ]'
        @click='onOwnerSelected(_owner)'
      >
        <div :class='[ "selector-indicator", _owner.selected ? "selector-indicator-selected" : "" ]' />
        <q-avatar color='red-1 selector-margin-x-left'>
          <q-img :src='db.ownerAvatar(_owner)' width='48px' height='48px' />
        </q-avatar>
        <div class='selector-margin-x-left'>
          <div class='text-bold text-grey-9'>
            {{ _owner.name }}
          </div>
          <div class='selector-item-endpoint'>
            0x{{ shortid.shortId(_owner.address, 5) }}
          </div>
        </div>
        <q-space />
        <div>
          <div class='row'>
            <q-space />
            <span>$</span>
            <strong class='text-grey-9'>{{ ownerBridge?.ownerBalance(_owner).toFixed(2) }}</strong>
            <span class='text-grey-6 header-items-margin-x-left'>USD</span>
          </div>
          <div class='row'>
            <span class='text-grey-9 selector-item-currency-sub'>{{ ownerBridge?.ownerBalance(_owner).toFixed(4) }}</span>
            <span class='text-grey-6 selector-item-currency-sub header-items-margin-x-left'>TLINERA</span>
          </div>
        </div>
        <div class='selector-margin-x-left'>
          <q-icon name='bi-three-dots-vertical' size='16px' @click='onActionClick(_owner)' />
        </div>
      </q-item>
    </q-list>
  </div>
  <OwnerBridge ref='ownerBridge' v-model:owners='owners' />
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'
import { db } from 'src/model'
import { shortid } from 'src/utils'

import OwnerBridge from '../bridge/db/OwnerBridge.vue'

const owners = ref([] as db.Owner[])
const searchText = ref('')

const owner = defineModel<db.Owner>()
const emit = defineEmits<{(ev: 'selected', value: db.Owner): void}>()

const displayOwners = computed(() => owners.value.filter((el) => {
  return el.name.includes(searchText.value) || el.address.includes(searchText.value)
}).sort((a, b) => {
  return b.selected as unknown as number - (a.selected as unknown as number)
}))

const ownerBridge = ref<InstanceType<typeof OwnerBridge>>()

const onActionClick = (owner: db.Owner) => {
  // TODO
  console.log(owner)
}

const onOwnerSelected = async (_owner: db.Owner) => {
  _owner.selected = true
  owner.value = _owner
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await ownerBridge.value?.updateOwner(_owner)
  emit('selected', _owner)
}

</script>
