<template>
  <div class='full-height overflow-scroll'>
    <div class='selector-search' v-if='searchable'>
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
        :class='[ "tab-panel-item selector-item-padding-right", (owner ? _owner.id === owner?.id : _owner.selected) ? "selector-item-selected" : "" ]'
        @click='onOwnerSelected(_owner)'
      >
        <div :class='[ "selector-indicator", (owner ? _owner.id === owner?.id : _owner.selected) ? "selector-indicator-selected" : "" ]' />
        <q-avatar color='red-1 selector-margin-x-left'>
          <q-img :src='dbModel.ownerAvatar(_owner)' width='48px' height='48px' />
        </q-avatar>
        <div class='selector-margin-x-left text-left'>
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
            <strong class='text-grey-9'>{{ ownerUsdBalances.get(_owner.address)?.toFixed(2) }}</strong>
            <span class='text-grey-6 header-items-margin-x-left'>USD</span>
          </div>
          <div class='row'>
            <q-img :src='lineraLogo' width='18px' height='18px' />
            <span class='text-grey-9 selector-item-currency-sub header-items-margin-x-left'>{{ ownerBalances.get(_owner.address)?.toFixed(4) }}</span>
            <span class='text-grey-6 selector-item-currency-sub header-items-margin-x-left'>TLINERA</span>
          </div>
        </div>
        <div class='selector-margin-x-left' v-if='showAction'>
          <q-icon name='bi-three-dots-vertical' size='16px' @click='onActionClick(_owner)' />
        </div>
      </q-item>
    </q-list>
  </div>
  <OwnerBridge ref='ownerBridge' v-model:owners='owners' />
</template>

<script setup lang='ts'>
import { computed, ref, toRef, watch } from 'vue'
import { dbModel } from 'src/model'
import { shortid } from 'src/utils'

import OwnerBridge from '../bridge/db/OwnerBridge.vue'

import { lineraLogo } from 'src/assets'
import { dbBridge } from 'src/bridge'

interface Props {
  persistent?: boolean
  searchable?: boolean
  showAction?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  persistent: true,
  searchable: true,
  showAction: true
})
const persistent = toRef(props, 'persistent')
const searchable = toRef(props, 'searchable')
const showAction = toRef(props, 'showAction')

const owners = ref([] as dbModel.Owner[])
const searchText = ref('')

const owner = defineModel<dbModel.Owner>()
const emit = defineEmits<{(ev: 'selected', value: dbModel.Owner): void}>()

const displayOwners = computed(() => owners.value.filter((el) => {
  return el.name.includes(searchText.value) || el.address.includes(searchText.value)
}))

const ownerBalances = ref(new Map<string, number>())
const ownerUsdBalances = ref(new Map<string, number>())

const onActionClick = (owner: dbModel.Owner) => {
  // TODO
  console.log(owner)
}

const onOwnerSelected = async (_owner: dbModel.Owner) => {
  owner.value = _owner
  if (persistent.value) {
    _owner.selected = true
    await dbBridge.Owner.update(_owner)
  }
  emit('selected', _owner)
}

watch(owners, async () => {
  for (const _owner of owners.value) {
    const token = await dbBridge.Token.native() as dbModel.Token
    const balance = await dbBridge.Owner.ownerBalance(_owner, token?.id || 0)
    ownerBalances.value.set(_owner.address, balance?.tokenBalance || 0)
    ownerUsdBalances.value.set(_owner.address, balance?.usdBalance || 0)
  }
})

</script>
