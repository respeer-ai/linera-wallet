<template>
  <q-item class='row full-width tab-panel-item' clickable :style='{ paddingLeft: xPadding, paddingRight: xPadding }'>
    <q-avatar size='32px'>
      <q-icon name='bi-arrow-right-square' size='24px' />
      <q-badge color='transparent' rounded transparent floating>
        <q-img :src='lineraLogo' width='14px' height='14px' />
      </q-badge>
    </q-avatar>
    <div class='selector-margin-x-left row' :style='{width: "calc(100% - 32px - " + xPadding + " - " + xPadding + ")"}'>
      <div>
        <div class='text-bold text-left'>
          {{ operationType }}
        </div>
        <div class='text-grey-9 row flex items-center'>
          <div>
            0x{{ shortid.shortId(operation.certificateHash || '', 8) }}
          </div>
          <div class='page-item-x-margin-left cursor-pointer'>
            <q-icon name='bi-copy' size='12px' :style='{marginBottom: "3px"}' />
          </div>
        </div>
        <div class='text-left label-text-small text-grey-6'>
          {{ date.formatDate(operation.createdAt, 'YYYY/MM/DD HH:mm:ss') }}
        </div>
      </div>
      <q-space />
      <div>
        <div v-if='operation.operationType === db.OperationType.TRANSFER' class='page-item-x-margin-left text-bold'>
          {{ transferAmount }} {{ token?.ticker }}
        </div>
        <div class='row'>
          <q-space />
          <div :class='[ operation.state === db.OperationState.FAILED ? "text-red-6" : "text-green" ]'>
            {{ db.OperationState[operation.state === db.OperationState.POST_PROCESSED ? db.OperationState.CONFIRMED : operation.state] }}
          </div>
        </div>
      </div>
    </div>
  </q-item>
  <TokenBridge ref='dbTokenBridge' />
</template>

<script setup lang='ts'>
import { db, rpc } from 'src/model'
import { computed, onMounted, ref, toRef } from 'vue'
import { date } from 'quasar'

import { lineraLogo } from 'src/assets'

import TokenBridge from '../bridge/db/TokenBridge.vue'
import { shortid } from 'src/utils'

interface Props {
  operation: db.ChainOperation
  xPadding?: string
}
const props = defineProps<Props>()
const operation = toRef(props, 'operation')
const xPadding = toRef(props, 'xPadding')

const operationType = computed(() => operation.value.operationType ? operation.value.operationType[0].toUpperCase() + operation.value.operationType.slice(1) : 'UNKNOWN')

const transferAmount = ref(0)
const token = ref(undefined as unknown as db.Token)

const dbTokenBridge = ref<InstanceType<typeof TokenBridge>>()

onMounted(async () => {
  if (operation.value.operationType === db.OperationType.TRANSFER) {
    const _operation = JSON.parse(operation.value.operation) as rpc.Operation
    transferAmount.value = Number(_operation.System.Transfer.amount)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    token.value = await dbTokenBridge.value?.nativeToken() as db.Token
  }
})

</script>
