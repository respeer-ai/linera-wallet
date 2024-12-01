<template>
  <div>
    <div class='row'>
      <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer text-grey-6' @click='onBackClick' />
      <p class='text-center text-grey-6 selector-title page-item-x-margin-left setting-action'>
        {{ operationType }}
      </p>
      <q-space />
      <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
    </div>
    <div class='row items-x-margin'>
      <div class='text-grey-9'>
        <strong>{{ $t('MSG_STATUS') }}</strong>
      </div>
      <q-space />
      <div class='text-green-8'>
        <strong>{{ operationState }}</strong>
      </div>
    </div>
    <div v-if='operation.certificateHash?.length' class='row vertical-items-margin items-x-margin'>
      <div class='text-grey-9'>
        <strong>{{ $t('MSG_TRANSACTION_ID') }}</strong>
      </div>
      <q-space />
      <div class='text-grey-6'>
        {{ shortid.shortId(operation.certificateHash || '', 8) }}
      </div>
      <div class='page-item-x-margin-left'>
        <q-icon name='bi-copy' size='16px' :style='{marginTop: "-3px"}' @click.stop='(evt) => _copyToClipboard(operation.certificateHash as string, evt)' />
      </div>
    </div>
    <q-separator class='vertical-menus-margin' />
    <div class='vertical-menus-margin decorate-underline text-bold items-x-margin'>
      {{ $t('MSG_MICROCHAIN') }}
    </div>
    <div class='vertical-menus-margin transfer-tip items-x-margin cursor-pointer'>
      <div class='setting-item word-break-all'>
        {{ operation.microchain }}
      </div>
      <div class='row vertical-items-margin' :style='{marginTop: "-24px"}'>
        <q-space />
        <q-img :src='microchainLogo' width='16px' height='16px' />
        <q-avatar size='16px' class='page-item-x-margin-left'>
          <q-img v-if='operationChain' :src='db.microchainAvatar(operationChain)' width='16px' height='16px' />
        </q-avatar>
      </div>
    </div>
    <div class='vertical-menus-margin decorate-underline text-bold items-x-margin'>
      {{ $t('MSG_TRANSACTION') }}
    </div>
    <div class='row vertical-menus-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_ACTION') }}</div>
      <q-space />
      <div>{{ operationType }}</div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_AMOUNT') }}</div>
      <q-space />
      <div><strong>{{ transferAmount }} {{ token?.ticker }}</strong></div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed word-break-all items-x-margin'>
      <div :style='{width: "128px"}'>
        {{ $t('MSG_CERTIFICATE_HASH') }}
      </div>
      <div class='text-right' :style='{width: "calc(100% - 148px)"}'>
        {{ operation.certificateHash }}
      </div>
    </div>
    <div class='row vertical-items-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_CREATED_AT') }}</div>
      <q-space />
      <div>{{ date.formatDate(operation.createdAt, 'YYYY/MM/DD HH:mm:ss') }}</div>
    </div>
    <div v-if='operation.failedAt' class='row extra-margin-bottom vertical-items-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_FAILED_AT') }}</div>
      <q-space />
      <div>{{ date.formatDate(operation.failedAt, 'YYYY/MM/DD HH:mm:ss') }}</div>
    </div>
    <div v-if='operation.failReason?.length' class='row extra-margin-bottom vertical-items-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_REASON') }}</div>
      <q-space />
      <div>{{ operation.failReason }}</div>
    </div>
    <div v-if='operation.applicationId' class='row extra-margin-bottom vertical-items-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_APPLICATION_ID') }}</div>
      <q-space />
      <div>{{ operation.applicationId }}</div>
    </div>
    <div v-if='operation.applicationType' class='row extra-margin-bottom vertical-items-margin decorate-underline-dashed items-x-margin'>
      <div>{{ $t('MSG_APPLICATION_TYPE') }}</div>
      <q-space />
      <div>{{ db.ApplicationType[operation.applicationType] }}</div>
    </div>
    <div class='vertical-menus-margin decorate-underline text-bold items-x-margin'>
      {{ $t('MSG_CODE') }}
    </div>
    <div class='extra-margin-bottom vertical-items-margin decorate-underline-dashed items-x-margin word-break-all'>
      <pre :style='{width: "calc(100% - 12px)"}' v-html='operationStr' />
    </div>
    <OwnerBridge ref='dbOwnerBridge' v-model:selected-owner='selectedOwner' />
    <MicrochainOwnerBridge v-if='selectedOwner' :owner='selectedOwner?.owner' v-model:microchain-owners='microchainOwners' />
  </div>
</template>

<script setup lang='ts'>
import { db, rpc } from 'src/model'
import { computed, onMounted, ref, toRef } from 'vue'
import { shortid } from 'src/utils'
import { date } from 'quasar'
import { _copyToClipboard } from 'src/utils/copycontent'
import { dbBridge } from 'src/bridge'

import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'

import { microchainLogo } from 'src/assets'

interface Props {
  operation: db.ChainOperation
}
const props = defineProps<Props>()
const operation = toRef(props, 'operation')

const selectedOwner = ref(undefined as unknown as db.Owner)
const microchainOwners = ref([] as db.MicrochainOwner[])
const token = ref(undefined as unknown as db.Token)
const transferAmount = ref(0)

const operationType = computed(() => {
  if (operation.value.operationType && operation.value.operationType !== db.OperationType.ANONYMOUS) {
    return operation.value.operationType[0].toUpperCase() + operation.value.operationType.slice(1)
  }
  const _operation = JSON.parse(operation.value.operation) as rpc.Operation
  if (_operation.System) {
    return 'System:' + Object.keys(_operation.System)[0]
  }
  if (_operation.User) {
    const patterns = operation.value.graphqlQuery?.match(/\).*{\s+([a-zA-Z]+)[($]/)
    if (!patterns) return 'User:Unknown'
    if (patterns?.length < 2) return 'User:Unknown'
    return 'User:' + patterns[1][0].toUpperCase() + patterns[1].slice(1)
  }
  return 'Unknown'
})

const operationChain = ref(undefined as unknown as db.Microchain)

const operationState = computed(() => db.OperationState[operation.value.state])
const operationStr = computed(() => JSON.stringify(JSON.parse(operation.value.operation), null, 2))

const emit = defineEmits<{(ev: 'back'): void,
  (ev: 'close'): void
}>()

const onBackClick = () => {
  emit('back')
}

const onCloseClick = () => {
  emit('close')
}

// TODO: parse application operation

onMounted(async () => {
  operationChain.value = await dbBridge.Microchain.microchain(operation.value.microchain) as db.Microchain
  if (operation.value.operationType === db.OperationType.TRANSFER) {
    token.value = await dbBridge.Token.native() as db.Token
    const _operation = JSON.parse(operation.value.operation) as rpc.Operation
    transferAmount.value = Number(_operation.System.Transfer.amount)
  }
})

</script>
