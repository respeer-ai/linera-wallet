<template>
  <div class='fill-parent text-center'>
    <q-space />
    <div v-if='chainOperations.length > 0'>
      <div v-for='chainOperation in displayChainOperations' :key='chainOperation.id' @click='onChainOperationClick(chainOperation)'>
        <ChainOperationCardView :operation='chainOperation' :x-padding='xPadding' />
      </div>
    </div>
    <div v-else class='page-item-placeholder'>
      <div>
        <q-icon name='bi-plus-circle' size='48px' color='grey-4' />
      </div>
      <div class='page-item-y-margin-top' v-html='$t("MSG_NEW_TO_LINERA_TRANSFER_TOKENS")' />
    </div>
    <q-space />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, toRef } from 'vue'
import { db } from 'src/model'
import { localStore } from 'src/localstores'

import ChainOperationCardView from './ChainOperationCardView.vue'
import { dbBridge } from 'src/bridge'

interface Props {
  microchain?: string
  xPadding?: string
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')
const xPadding = toRef(props, 'xPadding')

const chainOperations = ref([] as db.ChainOperation[])
const displayChainOperations = computed(() => {
  return [...chainOperations.value].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
})

const loadChainOperationsRecursive = async (total: number, offset: number, limit: number) => {
  if (offset >= total) return
  chainOperations.value.push(...(await dbBridge.ChainOperation.chainOperations(offset, limit, microchain.value)) || [])
  void loadChainOperationsRecursive(total, offset + limit, limit)
}

const loadChainOperations = async () => {
  chainOperations.value = []
  const count = await dbBridge.ChainOperation.count()
  await loadChainOperationsRecursive(count, 0, 10)
}

onMounted(() => {
  void loadChainOperations()
})

const onChainOperationClick = (operation: db.ChainOperation) => {
  localStore.setting.HomeAction = localStore.settingDef.HomeAction.SHOW_OPERATION
  localStore.setting.HomeActionParams = operation
}

</script>
