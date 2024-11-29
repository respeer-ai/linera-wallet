<template>
  <q-card class='selector-card'>
    <div class='row page-x-padding'>
      <q-icon name='bi-arrow-left-short' size='24px' class='cursor-pointer' @click='onBackClick' />
      <q-space />
      <p class='text-center text-bold text-grey-9 selector-title'>
        {{ $t('MSG_SHOW_PRIVATE_KEY') }}
      </p>
      <q-space />
      <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
    </div>
    <div class='page-x-padding vertical-menus-margin'>
      <AccountDetailAvatarView v-if='owner' :owner='owner' :editable='false' />
      <div class='row vertical-menus-margin'>
        <q-space />
        <div class='row bg-red-1 tip cursor-pointer label-radius'>
          <div>
            0x{{ shortid.shortId(owner.owner, 10) }}
          </div>
          <div class='page-item-x-margin-left'>
            <q-icon name='bi-copy' size='16px' :style='{marginTop: "-3px"}' @click.stop='(evt) => _copyToClipboard(owner.address, evt)' />
          </div>
        </div>
        <q-space />
      </div>
      <div class='password vertical-sections-margin'>
        <div class='text-grey-9'>
          {{ $t('MSG_VERIFY_PASSWORD') }}
        </div>
        <div class='vertical-items-margin'>
          <q-input outlined dense v-model='_password' type='password' />
        </div>
      </div>
      <div class='row warn vertical-sections-margin private-key-warn'>
        <q-icon name='bi-exclamation-triangle-fill' color='red-8' size='24px' />
        <div :style='{width: "calc(100% - 24px - 12px)"}' class='selector-margin-x-left' v-html='$t("MSG_WARNING_DO_NOT_LEAK_THIS_PRIVATE_KEY")' />
      </div>
      <q-btn
        flat no-caps class='btn full-width vertical-sections-margin'
        label='Confirm'
        @click='onConfirmClick'
        :disable='_password.length === 0 || !password?.length || _password !== password '
      />
      <q-btn
        flat no-caps class='btn btn-alt full-width vertical-items-margin'
        label='Cancel'
        @click='onCancelClick'
      />
    </div>
  </q-card>
  <DbOwnerBalanceBridge v-model:token-balance='tokenBalance' v-model:usd-balance='usdBalance' :token-id='nativeTokenId' />
  <PasswordBridge v-model:password='password' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { shortid } from 'src/utils'
import { _copyToClipboard } from 'src/utils/copycontent'
import { dbBridge } from 'src/bridge'

import DbOwnerBalanceBridge from '../bridge/db/OwnerBalanceBridge.vue'
import AccountDetailAvatarView from './AccountDetailAvatarView.vue'
import PasswordBridge from '../bridge/db/PasswordBridge.vue'

interface Props {
  owner: db.Owner
}
const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const tokenBalance = ref(0)
const usdBalance = ref(0)
const nativeTokenId = ref(0)

const _password = ref('')
const password = ref('')

const emit = defineEmits<{(ev: 'canceled'): void,
  (ev: 'back'): void,
  (ev: 'confirmed'): void
}>()

const onCloseClick = () => {
  emit('canceled')
}

const onBackClick = () => {
  emit('back')
}

onMounted(async () => {
  nativeTokenId.value = (await dbBridge.Token.native())?.id as number
})

const onConfirmClick = () => {
  emit('confirmed')
}

const onCancelClick = () => {
  emit('back')
}

</script>

<style scope lang='sass'>

</style>
