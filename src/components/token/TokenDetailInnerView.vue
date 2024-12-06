<template>
  <div>
    <div :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_TOKEN_INFORMATION') }}
    </div>
    <div class='row vertical-items-margin'>
      <q-img :src='tokenLogo' width='128px' class='page-item-x-margin-left' />
      <div class='page-x-padding selector-y-padding selector-margin-x-left' :style='{width: "calc(100% - 128px - 12px - 12px)"}'>
        <div v-html='token.description?.length > 0 ? token.description : "The creator <strong>DID NOT</strong> leave any description to the token! Please make sure you know the <strong>RISK</strong> to interact with the token!"' />
        <div class='row vertical-sections-margin'>
          <q-img
            v-if='token.github?.length > 0' :src='githubLogo' width='20px' height='20px'
            class='cursor-pointer clickable selector-margin-x-right'
          />
          <q-img
            v-if='token.discord?.length > 0' :src='discordLogo' width='20px' height='20px'
            class='cursor-pointer clickable selector-margin-x-right'
          />
          <q-img
            v-if='token.twitter?.length > 0' :src='twitterLogo' width='20px' height='20px'
            class='cursor-pointer clickable selector-margin-x-right'
          />
          <q-img
            v-if='token.telegram?.length > 0' :src='telegramLogo' width='20px' height='20px'
            class='cursor-pointer clickable selector-margin-x-right'
          />
          <q-img
            v-if='token.website?.length > 0' :src='githubLogo' width='20px' height='20px'
            class='cursor-pointer clickable'
          />
        </div>
      </div>
    </div>
    <div v-if='!token.native' :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_TOKEN_PRICE') }}
    </div>
    <div v-if='ownerBalances.length || chainBalances.length' :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_BALANCES') }}
    </div>
    <div v-if='ownerBalances.length || chainBalances.length'>
      <TokenBalanceCardView
        v-for='balance in ownerBalances' :key='balance.id' :token='token' :show-indicator='false'
        :owner-balance='balance' :x-padding='localStore.setting.extensionMode ? "8px" : "0"'
      />
      <TokenBalanceCardView
        v-for='balance in chainBalances' :key='balance.id' :token='token' :show-indicator='false'
        :chain-balance='balance' :x-padding='localStore.setting.extensionMode ? "8px" : "0"'
      />
    </div>
    <div :class='[ "vertical-sections-margin text-bold label-text-large text-grey-9 decorate-underline", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      {{ $t('MSG_TOKEN_DETAILS') }}
    </div>
    <div v-if='!token.native' :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_APPLICATION_ID') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          {{ token.applicationId }}
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' @click.stop='(evt) => _copyToClipboard(token.applicationId as string, evt)' />
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_TOKEN_NAME') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          {{ token.name }}
        </div>
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_TOKEN_TYPE') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          {{ token.tokenType }}
        </div>
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_TOKEN_SYMBOL') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          {{ token.ticker }}
        </div>
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_TOKEN_LOGO') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <q-img :src='tokenLogo' width='32px' height='32px' />
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_TOTAL_SUPPLY') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          {{ token.totalSupply }}
        </div>
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_GITHUB') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          <a :href='token.github'>{{ token.github }}</a>
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' @click.stop='(evt) => _copyToClipboard(token.github as string, evt)' />
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_OFFICIAL_WEBSITE') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          <a :href='token.website'>{{ token.website }}</a>
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' @click.stop='(evt) => _copyToClipboard(token.website as string, evt)' />
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_TELEGRAM') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          <a :href='token.telegram'>{{ token.telegram }}</a>
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' @click.stop='(evt) => _copyToClipboard(token.telegram as string, evt)' />
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_TWITTER') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          <a :href='token.twitter'>{{ token.twitter }}</a>
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' @click.stop='(evt) => _copyToClipboard(token.twitter as string, evt)' />
      </div>
    </div>
    <div :class='[ "row decorate-underline-dashed vertical-menus-margin cursor-pointer microchain-detail-line", localStore.setting.extensionMode ? "setting-item-inner-padding" : "" ]'>
      <div class='microchain-detail-label text-grey-8 flex items-center'>
        {{ $t('MSG_DISCORD') }}
      </div>
      <q-space />
      <div class='word-break-all row microchain-detail-value flex items-center justify-center row'>
        <q-space />
        <div class='word-break-all microchain-detail-value-text text-right'>
          <a :href='token.discord'>{{ token.discord }}</a>
        </div>
        <q-icon name='bi-copy' size='12px' class='microchain-detail-copy-icon page-item-x-margin-left' @click.stop='(evt) => _copyToClipboard(token.discord as string, evt)' />
      </div>
    </div>
  </div>
  <OwnerBridge v-model:selected-owner='selectedOwner' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef, watch } from 'vue'
import { localStore } from 'src/localstores'
import { _copyToClipboard } from 'src/utils/copycontent'
import { dbBridge } from 'src/bridge'

import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import TokenBalanceCardView from './TokenBalanceCardView.vue'

import { discordLogo, githubLogo, telegramLogo, twitterLogo } from 'src/assets'

interface Props {
  token: db.Token
}
const props = defineProps<Props>()
const token = toRef(props, 'token')

const selectedOwner = ref(undefined as unknown as db.Owner)
const ownerBalances = ref([] as db.MicrochainOwnerFungibleTokenBalance[])
const chainBalances = ref([] as db.MicrochainFungibleTokenBalance[])

const tokenLogo = ref('')

watch(selectedOwner, async () => {
  ownerBalances.value = await dbBridge.MicrochainOwnerFungibleTokenBalance.balances(selectedOwner.value?.owner, token.value.id as number)
  chainBalances.value = await dbBridge.MicrochainFungibleTokenBalance.balances(selectedOwner.value?.owner, token.value.id as number)
})

onMounted(async () => {
  ownerBalances.value = await dbBridge.MicrochainOwnerFungibleTokenBalance.balances(selectedOwner.value?.owner, token.value.id as number)
  chainBalances.value = await dbBridge.MicrochainFungibleTokenBalance.balances(selectedOwner.value?.owner, token.value.id as number)
  tokenLogo.value = await dbBridge.Token.logo(token.value.id as number) as string
})

</script>
