<template>
  <div>
    <div :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_CHAIN_BALANCE') }}
    </div>
    <div class='vertical-items-margin'>
      <MicrochainCardView
        :microchain='microchain' :show-account-balance='false' :integrated-mode='false' :clickable='false'
        :show-indicator='false' :x-padding='localStore.setting.extensionMode ? "8px" : "0"'
      />
    </div>
    <div :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_ACCOUNT_BALANCE') }}
    </div>
    <div class='vertical-items-margin'>
      <MicrochainCardView
        :microchain='microchain' :show-account-balance='true' :integrated-mode='false' :clickable='false'
        :show-indicator='false' :x-padding='localStore.setting.extensionMode ? "8px" : "0"'
      />
    </div>
    <div v-if='namedApplications.length > 0' :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_NAMED_APPLICATIONS') }}
    </div>
    <div v-if='namedApplications.length > 0'>
      <RequestNamedApplicationCardView
        v-for='namedApplication in namedApplications' :key='namedApplication.id' :named-application='namedApplication' :microchain='microchain'
        :x-padding='localStore.setting.extensionMode ? "8px" : "0"' :requested='chainApplications.findIndex((el) => el.id === namedApplication.applicationId) >= 0'
        @requested='onNamedApplicationRequested'
      />
    </div>
    <div v-if='requestedTokens.length > 0' :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_REQUESTED_TOKENS') }}
    </div>
    <div v-if='requestedTokens.length > 0'>
      <MicrochainTokenBalanceCardView
        v-for='token in requestedTokens' :key='token.id' :token='token' :microchain='microchain'
        :show-indicator='false' :x-padding='localStore.setting.extensionMode ? "8px" : "0"'
      />
    </div>
    <div v-if='importedTokens.length > 0' :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_IMPORTED_TOKENS') }}
    </div>
    <div v-if='importedTokens.length > 0'>
      <RequestTokenCardView
        v-for='token in importedTokens' :key='token.id' :token='token' :microchain='microchain'
        :show-indicator='false' :x-padding='localStore.setting.extensionMode ? "8px" : "0"'
        @requested='onTokenRequested' :requested='chainApplications.findIndex((el) => el.id === token.applicationId) >= 0'
      />
    </div>
    <div :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_CHAIN_DETAILS') }}
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_MICROCHAIN_ID') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          {{ microchain.microchain }}
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' @click.stop='(evt) => _copyToClipboard(microchain.microchain, evt)' />
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_CREATION_MESSAGE_ID') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='microchain-detail-value-text  text-right'>
          {{ microchain.messageId }}
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' @click.stop='(evt) => _copyToClipboard(microchain.messageId, evt)' />
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_CREATION_CERTIFICATE_HASH') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='microchain-detail-value-text text-right'>
          {{ microchain.certificateHash }}
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' @click.stop='(evt) => _copyToClipboard(microchain.certificateHash, evt)' />
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_DEFAULT_CHAIN') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value'>
        <div class='full-width text-right'>
          {{ microchain.default ? 'YES' : 'NO' }}
        </div>
      </div>
    </div>
    <div :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_CHAIN_OPERATIONS') }}
    </div>
    <div class='extra-large-bottom-margin'>
      <ChainOperationsView x-padding='8px' />
    </div>
    <div :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_CHAIN_ACTIVITIES') }}
    </div>
    <div class='extra-large-bottom-margin'>
      <ActivitiesView x-padding='8px' />
    </div>
  </div>
  <MicrochainBalanceBridge :token-id='nativeTokenId' v-model:token-balance='chainTokenBalance' v-model:usd-balance='chainUsdBalance' />
  <MicrochainOwnerBalanceBridge
    :token-id='nativeTokenId' v-model:token-balance='accountTokenBalance' v-model:usd-balance='accountUsdBalance' :owner='selectedOwner?.owner'
    :microchain-id='microchain.microchain'
  />
  <OwnerBridge v-model:selected-owner='selectedOwner' />
  <ActivityBridge v-model:activities='activities' :microchain='microchain.microchain' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { localStore } from 'src/localstores'
import { _copyToClipboard } from 'src/utils/copycontent'
import { type ApplicationOverview } from 'src/__generated__/graphql/sdk/graphql'
import { dbBridge, rpcBridge } from 'src/bridge'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'

import MicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import MicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import MicrochainCardView from './MicrochainCardView.vue'
import ActivityBridge from '../bridge/db/ActivityBridge.vue'
import ActivitiesView from '../activity/ActivitiesView.vue'
import ChainOperationsView from '../activity/ChainOperationsView.vue'
import MicrochainTokenBalanceCardView from './MicrochainTokenBalanceCardView.vue'
import RequestTokenCardView from './RequestTokenCardView.vue'
import RequestNamedApplicationCardView from './RequestNamedApplicationCardView.vue'

interface Props {
  microchain: db.Microchain
}
const props = defineProps<Props>()
const microchain = toRef(props, 'microchain')

const chainTokenBalance = ref(0)
const chainUsdBalance = ref(0)
const accountTokenBalance = ref(0)
const accountUsdBalance = ref(0)
const activities = ref([] as db.Activity[])

const selectedOwner = ref(undefined as unknown as db.Owner)

const nativeTokenId = ref(undefined as unknown as number)
const requestedTokens = ref([] as db.Token[])
const importedTokens = ref([] as db.Token[])
const namedApplications = ref([] as db.NamedApplication[])
const chainApplications = ref([] as ApplicationOverview[])

const formalizeRequestedTokens = async () => {
  for (const token of requestedTokens.value) {
    if (importedTokens.value.findIndex((el) => el.applicationId === token.applicationId) >= 0) continue
    const exist = await rpcBridge.ApplicationOperation.existChainApplication(microchain.value.microchain, token.applicationId as string)
    if (!exist) {
      importedTokens.value.push(token)
      continue
    }
    const creationChain = await lineraWasm.application_creation_chain_id(token.applicationId as string)
    if (creationChain === microchain.value.microchain) {
      continue
    }
    const subscribed = await rpcBridge.ApplicationOperation.subscribedCreatorChain(microchain.value.microchain, token.applicationId as string)
    if (!subscribed) importedTokens.value.push(token)
  }
}

onMounted(async () => {
  nativeTokenId.value = (await dbBridge.Token.native())?.id as number
  const applicationIds = (await rpcBridge.Application.applications([microchain.value.microchain])).map((app: ApplicationOverview) => app.id as string)
  requestedTokens.value = (await dbBridge.Token.tokens(0, 1000, applicationIds)).filter((el) => !el.native)
  importedTokens.value = (await dbBridge.Token.tokens(0, 1000)).filter((token: db.Token) => !token.native && !applicationIds.includes(token.applicationId as string))
  namedApplications.value = (await dbBridge.NamedApplication.namedApplications()).filter((el) => el.applicationType !== db.ApplicationType.WLINERA)
  chainApplications.value = await rpcBridge.Application.microchainApplications(microchain.value.microchain)

  await formalizeRequestedTokens()
})

const onNamedApplicationRequested = async () => {
  chainApplications.value = await rpcBridge.Application.microchainApplications(microchain.value.microchain)
}

const onTokenRequested = async () => {
  chainApplications.value = await rpcBridge.Application.microchainApplications(microchain.value.microchain)
}

</script>
