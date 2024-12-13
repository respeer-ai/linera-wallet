<template>
  <q-btn-dropdown
    flat filled class='btn-alt full-width btn-radius btn-grey-border vertical-menus-margin'
    no-caps dense
    dropdown-icon='bi-chevron-down'
    menu-anchor='bottom left'
    menu-self='top left'
    @click='onAccountClick'
  >
    <template #label>
      <div class='row full-width'>
        <q-avatar>
          <q-img v-if='selectedOwner' :src='db.ownerAvatar(selectedOwner)' width='36px' height='36px' />
        </q-avatar>
        <div v-if='selectedOwner' class='header-items-margin-x-left text-left'>
          <div>
            {{ selectedOwner.name }}
          </div>
          <div class='text-grey-6 page-header-network'>
            0x{{ shortid.shortId(selectedOwner.owner, 6) }}
          </div>
        </div>
      </div>
    </template>
  </q-btn-dropdown>
  <q-btn-dropdown
    flat filled class='btn-alt full-width btn-radius btn-grey-border vertical-items-margin extra-large-margin-bottom'
    no-caps dense
    dropdown-icon='bi-chevron-down'
    menu-anchor='bottom left'
    menu-self='top left'
    @click='onMicrochainClick'
    v-if='microchains.length > 0'
  >
    <template #label>
      <div class='row full-width'>
        <q-avatar>
          <q-img v-if='selectedMicrochain' :src='db.microchainAvatar(selectedMicrochain)' width='36px' height='36px' />
        </q-avatar>
        <div v-if='selectedMicrochain' class='header-items-margin-x-left text-left'>
          <div>
            {{ selectedMicrochain.name || 'Microchain' }}
          </div>
          <div class='text-grey-6 page-header-network'>
            0x{{ shortid.shortId(selectedMicrochain.microchain, 6) }}
          </div>
        </div>
      </div>
    </template>
  </q-btn-dropdown>
  <div v-else class='btn-alt full-width btn-radius btn-grey-border vertical-items-margin transfer-tip text-grey-6 cursor-pointer extra-large-margin-bottom'>
    {{ $t('MSG_NO_USABLE_MICROCHAIN') }} <span class='like-link'>{{ $t('MSG_CREATE') }}</span>
  </div>
  <div class='row text-center extra-large-margin-bottom'>
    <q-space />
    <q-input
      class='label-text-extra-large text-right' dense v-model='amount' :style='{ width: inputWidth, minWidth: "16px", maxWidth: "calc(100% - 42px)" }'
      autofocus type='number'
    />
    <div class='label-text-extra-large page-item-x-margin-left'>
      {{ $t('MSG_TEST_LINERA_TOKEN_SYMBOL') }}
    </div>
    <q-space />
  </div>
  <div class='row tip info-bg vertical-sections-margin flax items-center justify-center'>
    <q-avatar>
      <q-img :src='lineraLogo' width='36px' height='36px' />
    </q-avatar>
    <div class='page-item-x-margin-left'>
      <div class='row'>
        <div class='text-grey-8'>
          {{ deductFromChainBalance ? 'Chain balance' : 'Account balance' }}
        </div>
        <div class='page-item-x-margin-left cursor-pointer' @click='onChangeFromBalanceClick'>
          <q-icon name='bi-arrow-down-up' size='12px' />
        </div>
      </div>
      <div>
        {{ deductFromChainBalance ? chainTokenBalance : accountTokenBalance }} {{ $t('MSG_TEST_LINERA_TOKEN_SYMBOL') }}
      </div>
    </div>
    <q-space />
    <div class='cursor-pointer text-blue-6' @click='onMaxAmountClick'>
      {{ $t('MSG_MAX') }}
    </div>
    <div class='page-item-x-margin-left' />
  </div>
  <div class='page-y-padding'>
    <q-btn
      flat
      rounded
      label='Mint now'
      class='btn full-width'
      @click='onMintNowClick'
      no-caps
      :disable='!canMint'
      :loading='minting'
    />
  </div>
  <DbOwnerBridge v-model:selected-owner='selectedOwner' />
  <DbMicrochainBridge v-if='selectedOwner' :owner='selectedOwner?.owner' v-model:microchains='microchains' />
  <q-dialog v-model='selectingOwner'>
    <OwnerSelector v-model='selectedOwner' @selected='onOwnerSelected' :creatable='false' :persistent='true' />
  </q-dialog>
  <q-dialog v-model='selectingMicrochain'>
    <MicrochainSelector :owner='selectedOwner?.owner' v-model='selectedMicrochain' @selected='onMicrochainSelected' />
  </q-dialog>
  <MicrochainOwnerBalanceBridge
    v-if='selectedOwner !== undefined && selectedMicrochain !== undefined' :owner='selectedOwner.owner' :microchain-id='selectedMicrochain.microchain' :token-id='nativeTokenId'
    v-model:token-balance='accountTokenBalance'
  />
  <MicrochainBalanceBridge v-if='selectedOwner !== undefined && selectedMicrochain !== undefined' :microchain-id='selectedMicrochain.microchain' :token-id='nativeTokenId' v-model:token-balance='chainTokenBalance' />
</template>

<script setup lang='ts'>
import { computed, onMounted, ref, toRef, watch } from 'vue'
import { shortid } from 'src/utils'
import { db, rpc } from 'src/model'
import { localStore } from 'src/localstores'
import { useI18n } from 'vue-i18n'

import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import OwnerSelector from '../selector/OwnerSelector.vue'
import MicrochainSelector from '../selector/MicrochainSelector.vue'
import MicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import MicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'

import { lineraLogo } from 'src/assets'
import { dbBridge, rpcBridge } from 'src/bridge'

const { t } = useI18n({ useScope: 'global' })

interface Props {
  token: db.Token
}
const props = defineProps<Props>()
const token = toRef(props, 'token')

const selectedOwner = defineModel<db.Owner>('selectedOwner')
const selectedMicrochain = defineModel<db.Microchain>('selectedMicrochain')
const microchains = ref([] as db.Microchain[])

const deductFromChainBalance = defineModel<boolean>('deductFromChainBalance')

const selectingOwner = ref(false)
const selectingMicrochain = ref(false)

const amount = defineModel<number>({ default: 0 })
const chainTokenBalance = ref(0)
const accountTokenBalance = ref(0)
const minting = ref(false)

watch(amount, () => {
  if (amount.value.toString().startsWith('0.0')) {
    if (!amount.value.toString().match(/[1-9]/)) {
      return
    }
  }
  amount.value = Math.min(deductFromChainBalance.value ? chainTokenBalance.value : accountTokenBalance.value, Number(amount.value))
})

const inputWidth = computed(() => ((Math.max(Math.min(amount.value.toString().length, 8), 3)) * 16 + 16).toString() + 'px')

const onAccountClick = () => {
  selectingOwner.value = true
}

const onOwnerSelected = () => {
  selectingOwner.value = false
}

const onMicrochainClick = () => {
  selectingMicrochain.value = true
}

const onMicrochainSelected = () => {
  selectingMicrochain.value = false
}

const canMint = computed(() => {
  return selectedOwner.value !== undefined &&
         selectedMicrochain.value !== undefined &&
         Number(amount.value) > 0
})

const emit = defineEmits<{(ev: 'minted'): void,
  (ev: 'error'): void
}>()

const onMintNowClick = async () => {
  if (!selectedMicrochain.value) return
  const chainAccountOwner = {
    chain_id: selectedMicrochain.value?.microchain
  } as rpc.ChainAccountOwner
  if (selectedOwner.value) {
    chainAccountOwner.owner = `User:${selectedOwner.value.owner}`
  }

  minting.value = true

  try {
    const operationId = await rpcBridge.ERC20ApplicationOperation.mint(
      selectedMicrochain.value?.microchain,
      token.value.applicationId as string,
      chainAccountOwner, amount.value)
    localStore.notification.pushNotification({
      Title: t('MSG_MINT_TOKEN'),
      Message: t('MSG_SUCCESS_MINT_TOKEN'),
      Popup: true,
      Type: localStore.notify.NotifyType.Info
    })
    await rpcBridge.Operation.waitOperation(operationId)
    emit('minted')
  } catch (error) {
    localStore.notification.pushNotification({
      Title: t('MSG_MINT_TOKEN'),
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: t('MSG_FAILED_MINT_TOKEN', { ERROR: error }),
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
    emit('error')
  }
  minting.value = false
}

const nativeTokenId = ref(undefined as unknown as number)

watch(selectedOwner, async () => {
  selectedMicrochain.value = (await dbBridge.Microchain.ownerMicrochains(0, 1000, selectedOwner.value?.owner as string))[0]
})

onMounted(async () => {
  nativeTokenId.value = (await dbBridge.Token.native())?.id as number
  if (selectedOwner.value) {
    selectedMicrochain.value = (await dbBridge.Microchain.ownerMicrochains(0, 1000, selectedOwner.value.owner))[0]
  }
})

const onChangeFromBalanceClick = () => {
  deductFromChainBalance.value = !deductFromChainBalance.value
}

const onMaxAmountClick = () => {
  amount.value = deductFromChainBalance.value ? chainTokenBalance.value : accountTokenBalance.value
}

</script>
