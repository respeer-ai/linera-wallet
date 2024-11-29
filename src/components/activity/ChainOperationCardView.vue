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
            <q-icon name='bi-copy' size='12px' :style='{marginBottom: "3px"}' @click.stop='(evt) => _copyToClipboard(operation.certificateHash as string, evt)' />
          </div>
        </div>
        <div class='text-left label-text-small text-grey-6'>
          {{ date.formatDate(operation.createdAt, 'YYYY/MM/DD HH:mm:ss') }}
        </div>
      </div>
      <q-space />
      <div>
        <div v-if='operation.operationType === db.OperationType.TRANSFER' class='page-item-x-margin-left text-bold'>
          {{ transferAmount.toFixed(4) }} {{ token?.ticker }}
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
</template>

<script setup lang='ts'>
import { db, rpc } from 'src/model'
import { computed, onMounted, ref, toRef } from 'vue'
import { date } from 'quasar'
import { _copyToClipboard } from 'src/utils/copycontent'
import { shortid } from 'src/utils'
import { lineraGraphqlMutationQueryWithQuery } from 'app/src-bex/middleware/types'

import { lineraLogo } from 'src/assets'
import { dbBridge } from 'src/bridge'

interface Props {
  operation: db.ChainOperation
  xPadding?: string
}
const props = defineProps<Props>()
const operation = toRef(props, 'operation')
const xPadding = toRef(props, 'xPadding')

const operationType = computed(() => {
  if (operation.value.operationType && operation.value.operationType !== db.OperationType.ANONYMOUS) {
    return operation.value.operationType[0].toUpperCase() + operation.value.operationType.slice(1)
  }
  const _operation = JSON.parse(operation.value.operation) as rpc.Operation
  if (_operation.System) {
    return 'System:' + Object.keys(_operation.System)[0]
  }
  if (_operation.User) {
    return 'User:' + (lineraGraphqlMutationQueryWithQuery(operation.value.graphqlQuery || '') || 'Unknown')
  }
  return 'Unknown'
})

const transferAmount = ref(0)
const token = ref(undefined as unknown as db.Token)

onMounted(async () => {
  if (operation.value.operationType === db.OperationType.TRANSFER) {
    const _operation = JSON.parse(operation.value.operation) as rpc.Operation
    transferAmount.value = Number(_operation.System.Transfer.amount)
    token.value = await dbBridge.Token.native() as db.Token
  }
})

</script>
