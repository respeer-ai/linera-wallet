<template>
  <div class='row'>
    <q-space />
    <q-avatar>
      <q-img :src='db.ownerAvatar(owner)' />
    </q-avatar>
    <div class='selector-margin-x-left account-avatar'>
      <div v-if='editing' class='row'>
        <q-input outlined dense v-model='owner.name' />
        <q-icon
          name='bi-check2' class='page-item-x-margin-left cursor-pointer' size='18px' :style='{marginTop: "3px"}'
          @click='onSaveClick'
        />
      </div>
      <div v-else class='row'>
        <span class='text-bold text-grey-9'>{{ owner.name }}</span>
        <q-icon
          v-if='editable'
          name='bi-pencil-square' class='page-item-x-margin-left cursor-pointer' size='15px' :style='{marginTop: "3px"}'
          @click='onEditClick'
        />
      </div>
      <div class='text-grey-8 selector-item-currency-sub'>
        $ {{ usdBalance.toFixed(4) }} USD
      </div>
    </div>
    <q-space />
  </div>
  <OwnerBridge ref='ownerBridge' />
  <DbOwnerBalanceBridge v-model:token-balance='tokenBalance' v-model:usd-balance='usdBalance' :token-id='nativeTokenId' />
  <DbTokenBridge ref='dbTokenBridge' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'

import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import DbOwnerBalanceBridge from '../bridge/db/OwnerBalanceBridge.vue'
import DbTokenBridge from '../bridge/db/TokenBridge.vue'
import { dbBridge } from 'src/bridge'

interface Props {
  owner: db.Owner
  editable?: boolean
}
const props = defineProps<Props>()
const owner = toRef(props, 'owner')
const editable = toRef(props, 'editable')

const editing = ref(false)

const ownerBridge = ref<InstanceType<typeof OwnerBridge>>()
const dbTokenBridge = ref<InstanceType<typeof DbTokenBridge>>()

const tokenBalance = ref(0)
const usdBalance = ref(0)
const nativeTokenId = ref(0)

const onEditClick = () => {
  editing.value = true
}

const onSaveClick = async () => {
  await dbBridge.Owner.update(owner.value)
  editing.value = false
}

onMounted(async () => {
  nativeTokenId.value = (await dbBridge.Token.native())?.id as number
})

</script>

<style scope lang='sass'>
.account-avatar
  .q-field--dense .q-field__control
    height: 22px
</style>
