<template>
  <div class='vertical-menus-margin decorate-underline'>
    {{ $t('MSG_TOKEN') }}
  </div>
  <q-btn-dropdown
    flat filled class='btn-alt full-width btn-radius btn-grey-border vertical-menus-margin'
    no-caps dense
    dropdown-icon='bi-chevron-down'
    menu-anchor='bottom left'
    menu-self='top left'
    @click='onTokenClick'
  >
    <template #label>
      <div class='row full-width'>
        <q-avatar>
          <q-img v-if='selectedToken' :src='selectedToken.logo' width='36px' height='36px' />
        </q-avatar>
        <div v-if='selectedToken' class='header-items-margin-x-left text-left' :style='{width: "calc(100% - 36px - 12px - 20px)"}'>
          <div>
            {{ selectedToken.ticker }}
          </div>
          <div v-if='selectedToken.native' class='text-grey-6 page-header-network'>
            {{ selectedToken.name }}
          </div>
          <div v-else class='text-grey-6 page-header-network'>
            0x{{ shortid.shortId(selectedToken.applicationId as string, 10) }}
          </div>
        </div>
      </div>
    </template>
  </q-btn-dropdown>
  <div class='vertical-menus-margin decorate-underline'>
    {{ $t('MSG_FROM') }}
  </div>
  <q-btn-dropdown
    flat filled class='btn-alt full-width btn-radius btn-grey-border vertical-menus-margin'
    no-caps dense
    dropdown-icon='bi-chevron-down'
    menu-anchor='bottom left'
    menu-self='top left'
    @click='onFromAccountClick'
  >
    <template #label>
      <div class='row full-width'>
        <q-avatar>
          <q-img v-if='selectedFromOwner' :src='db.ownerAvatar(selectedFromOwner)' width='36px' height='36px' />
        </q-avatar>
        <div v-if='selectedFromOwner' class='header-items-margin-x-left text-left'>
          <div>
            {{ selectedFromOwner.name }}
          </div>
          <div class='text-grey-6 page-header-network'>
            0x{{ shortid.shortId(selectedFromOwner.owner, 6) }}
          </div>
        </div>
      </div>
    </template>
  </q-btn-dropdown>
  <q-btn-dropdown
    flat filled class='btn-alt full-width btn-radius btn-grey-border vertical-items-margin'
    no-caps dense
    dropdown-icon='bi-chevron-down'
    menu-anchor='bottom left'
    menu-self='top left'
    @click='onFromMicrochainClick'
    v-if='fromMicrochains.length > 0'
  >
    <template #label>
      <div class='row full-width'>
        <q-avatar>
          <q-img v-if='selectedFromMicrochain' :src='db.microchainAvatar(selectedFromMicrochain)' width='36px' height='36px' />
        </q-avatar>
        <div v-if='selectedFromMicrochain' class='header-items-margin-x-left text-left'>
          <div>
            {{ selectedFromMicrochain.name || 'Microchain' }}
          </div>
          <div class='text-grey-6 page-header-network'>
            0x{{ shortid.shortId(selectedFromMicrochain.microchain, 6) }}
          </div>
        </div>
      </div>
    </template>
  </q-btn-dropdown>
  <div v-else class='btn-alt full-width btn-radius btn-grey-border vertical-items-margin transfer-tip text-grey-6 cursor-pointer'>
    {{ $t('MSG_NO_USABLE_MICROCHAIN') }} <span class='like-link'>{{ $t('MSG_CREATE') }}</span>
  </div>
  <div class='vertical-items-margin' v-if='fromMicrochains.length > 0 && selectedToken?.native'>
    <q-toggle
      dense
      rounded
      :label='$t("MSG_SEND_FROM_MICROCHAIN_BALANCE")'
      v-model='fromChainBalance'
    />
  </div>

  <div class='vertical-sections-margin decorate-underline row'>
    {{ $t('MSG_TO') }}
  </div>
  <div class='vertical-menus-margin'>
    <q-input v-if='selectedToOwner === undefined' outlined v-model='toAddress' placeholder='Input owner (not public key)'>
      <template #append>
        <div class='text-blue-8 cursor-pointer label-text-small' @click='onSelectToAccountClick'>
          {{ $t('MSG_SELECT') }}
        </div>
      </template>
    </q-input>
    <q-btn-dropdown
      v-else
      flat filled class='btn-alt full-width btn-radius btn-grey-border'
      no-caps dense
      dropdown-icon='bi-chevron-down'
      menu-anchor='bottom left'
      menu-self='top left'
      @click='onToAccountClick'
    >
      <template #label>
        <div class='row full-width'>
          <q-avatar>
            <q-img v-if='selectedToOwner' :src='db.ownerAvatar(selectedToOwner)' width='36px' height='36px' />
          </q-avatar>
          <div class='header-items-margin-x-left text-left'>
            <div>
              {{ selectedToOwner?.name || 'Microchain' }}
            </div>
            <div class='text-grey-6 page-header-network'>
              0x{{ shortid.shortId(selectedToOwner?.owner, 6) }}
            </div>
          </div>
          <q-space />
          <div class='flex justify-center items-center cursor-pointer' @click='onClearToAccountClick'>
            <q-icon name='bi-x' size='20px' />
          </div>
        </div>
      </template>
    </q-btn-dropdown>
  </div>
  <div class='vertical-items-margin'>
    <q-input
      v-if='selectedToMicrochain === undefined' outlined v-model='toMicrochain' placeholder='Input microchain ID'
      :disable='!selectedToOwner && !toAddress'
    >
      <template #append>
        <div class='text-blue-8 cursor-pointer label-text-small' @click='onSelectToMicrochainClick'>
          {{ $t('MSG_SELECT') }}
        </div>
      </template>
    </q-input>
    <q-btn-dropdown
      v-else
      flat filled class='btn-alt full-width btn-radius btn-grey-border'
      no-caps dense
      dropdown-icon='bi-chevron-down'
      menu-anchor='bottom left'
      menu-self='top left'
      @click='onToMicrochainClick'
    >
      <template #label>
        <div class='row full-width'>
          <q-avatar>
            <q-img v-if='selectedToMicrochain' :src='db.microchainAvatar(selectedToMicrochain)' width='36px' height='36px' />
          </q-avatar>
          <div class='header-items-margin-x-left text-left'>
            <div>
              {{ selectedToMicrochain?.name || 'Microchain' }}
            </div>
            <div class='text-grey-6 page-header-network'>
              0x{{ shortid.shortId(selectedToMicrochain?.microchain, 6) }}
            </div>
          </div>
          <q-space />
          <div class='flex justify-center items-center cursor-pointer' @click='onClearToMicrochainClick'>
            <q-icon name='bi-x' size='20px' />
          </div>
        </div>
      </template>
    </q-btn-dropdown>
  </div>
  <div class='vertical-items-margin' v-if='toMicrochain && toMicrochain.length > 0 && selectedToken?.native'>
    <q-toggle
      dense
      rounded
      :label='$t("MSG_SEND_TO_MICROCHAIN_BALANCE")'
      v-model='toChainBalance'
    />
  </div>

  <div class='page-y-padding'>
    <q-btn
      flat
      rounded
      :label='$t("MSG_CONTINUE")'
      class='btn full-width extra-margin-bottom'
      @click='onTransferClick'
      no-caps
      :disable='!canGotoNext'
    />
  </div>
  <q-dialog v-model='selectingFromOwner'>
    <OwnerSelector v-model='selectedFromOwner' @selected='onFromOwnerSelected' :creatable='false' :persistent='false' />
  </q-dialog>
  <q-dialog v-model='selectingFromMicrochain'>
    <MicrochainSelector :owner='selectedFromOwner?.owner' v-model='selectedFromMicrochain' @selected='onFromMicrochainSelected' />
  </q-dialog>
  <q-dialog v-model='selectingToOwner'>
    <OwnerSelector v-model='selectedToOwner' @selected='onToOwnerSelected' :creatable='false' :persistent='false' />
  </q-dialog>
  <q-dialog v-model='selectingToMicrochain'>
    <MicrochainSelector :owner='selectedToOwner?.owner' v-model='selectedToMicrochain' @selected='onToMicrochainSelected' />
  </q-dialog>
  <q-dialog v-model='selectingToken'>
    <TokenSelector v-model='selectedToken' @selected='onTokenSelected' />
  </q-dialog>
</template>

<script setup lang='ts'>
import { computed, onMounted, ref, watch } from 'vue'
import { shortid } from 'src/utils'
import { db } from 'src/model'
import { dbBridge } from 'src/bridge'

import OwnerSelector from '../selector/OwnerSelector.vue'
import MicrochainSelector from '../selector/MicrochainSelector.vue'
import TokenSelector from '../selector/TokenSelector.vue'

const selectedFromOwner = defineModel<db.Owner>('selectedFromOwner')
const selectedFromMicrochain = defineModel<db.Microchain>('selectedFromMicrochain')
const fromMicrochains = ref([] as db.Microchain[])

const selectedToOwner = defineModel<db.Owner>('selectedToOwner')
const selectedToMicrochain = defineModel<db.Microchain>('selectedToMicrochain')
const toAddress = defineModel<string>('toAddress')
const toMicrochain = defineModel<string>('toMicrochain')

const fromChainBalance = defineModel<boolean>('fromChainBalance')
const toChainBalance = defineModel<boolean>('toChainBalance')

const selectedToken = defineModel<db.Token>('selectedToken')

const selectingFromOwner = ref(false)
const selectingFromMicrochain = ref(false)
const selectingToOwner = ref(false)
const selectingToMicrochain = ref(false)
const selectingToken = ref(false)

const onFromAccountClick = () => {
  selectingFromOwner.value = true
}

const onFromOwnerSelected = () => {
  selectingFromOwner.value = false
}

const onFromMicrochainClick = () => {
  selectingFromMicrochain.value = true
}

const onFromMicrochainSelected = () => {
  selectingFromMicrochain.value = false
}

const onSelectToAccountClick = () => {
  selectingToOwner.value = true
}

const onToAccountClick = () => {
  selectingToOwner.value = true
}

const onSelectToMicrochainClick = () => {
  selectingToMicrochain.value = true
}

const onToMicrochainSelected = () => {
  selectingToMicrochain.value = false
}

const onToMicrochainClick = () => {
  selectingToMicrochain.value = true
}

const onClearToMicrochainClick = () => {
  selectedToMicrochain.value = undefined
  toMicrochain.value = ''
}

const onClearToAccountClick = () => {
  selectedToOwner.value = undefined
  selectedToMicrochain.value = undefined
  toAddress.value = ''
  toMicrochain.value = ''
}

const onToOwnerSelected = (owner?: db.Owner) => {
  selectingToOwner.value = false
  toAddress.value = owner?.owner || ''
}

const onTokenClick = () => {
  selectingToken.value = true
}

const onTokenSelected = () => {
  selectingToken.value = false
}

watch(selectedToMicrochain, () => {
  toMicrochain.value = selectedToMicrochain.value?.microchain
})

const canGotoNext = computed(() => {
  return selectedFromOwner.value !== undefined &&
         selectedFromMicrochain.value !== undefined &&
         toAddress.value &&
         toAddress.value.length > 0 &&
         toMicrochain.value &&
         toMicrochain.value.length > 0
})

watch(selectedFromOwner, async () => {
  if (!selectedFromOwner.value) return
  fromMicrochains.value = await dbBridge.Microchain.ownerMicrochains(0, 1000, selectedFromOwner.value?.owner)
  selectedFromMicrochain.value = fromMicrochains.value.find((el) => el.default) || fromMicrochains.value[0]
})

watch(selectedToOwner, async () => {
  if (!selectedToOwner.value) return
  const microchains = await dbBridge.Microchain.ownerMicrochains(0, 1000, selectedToOwner.value?.owner)
  selectedToMicrochain.value = microchains.find((el) => el.default) || microchains[0]
})

const emit = defineEmits<{(ev: 'next'): void}>()

const onTransferClick = () => {
  emit('next')
}

onMounted(async () => {
  if (!selectedFromOwner.value) {
    selectedFromOwner.value = await dbBridge.Owner.selected()
  }
  if (selectedFromOwner.value) {
    fromMicrochains.value = await dbBridge.Microchain.ownerMicrochains(0, 1000, selectedFromOwner.value?.owner)
    selectedFromMicrochain.value = fromMicrochains.value.find((el) => el.default) || fromMicrochains.value[0]
  }

  if (selectedToOwner.value) {
    const microchains = await dbBridge.Microchain.ownerMicrochains(0, 1000, selectedToOwner.value?.owner)
    selectedFromMicrochain.value = microchains.find((el) => el.default) || microchains[0]
  }
})

</script>
