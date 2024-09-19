<template>
  <q-card class='selector-card'>
    <div class='row page-x-padding'>
      <q-space />
      <p class='text-center text-bold text-grey-9 selector-title'>
        Show private key
      </p>
      <q-space />
      <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
    </div>
    <div class='page-x-padding vertical-items-margin'>
      <AccountDetailAvatarView v-if='owner' :owner='owner' :editable='false' />
      <div v-if='password?.length > 0' class='row bg-red-1 tip vertical-sections-margin flex justify-center items-center cursor-pointer'>
        <div class='word-break-all' :style='{width: "calc(100% - 16px)", padding: "8px"}'>
          {{ db.privateKey(owner, password) }}
        </div>
        <q-icon name='bi-copy' size='16px' />
      </div>
      <div class='row warn vertical-sections-margin private-key-warn'>
        <q-icon name='bi-exclamation-triangle-fill' color='red-8' size='24px' />
        <div :style='{width: "calc(100% - 24px - 12px)"}' class='selector-margin-x-left'>
          Warning: DO NOT leak this private key! People who have this private key can access any assets in this account.
        </div>
      </div>
      <div class='vertical-sections-margin'>
        <q-btn
          :loading='confirmedSeconds > 0 && confirmedSeconds < confirmSeconds'
          :percentage='confirmedSeconds * 100 / confirmSeconds'
          flat dense class='btn full-width' label='Done'
          no-caps
          @click='onDoneClick'
        />
      </div>
    </div>
  </q-card>
  <PasswordBridge v-model:password='password' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { ref, toRef } from 'vue'

import AccountDetailAvatarView from './AccountDetailAvatarView.vue'
import PasswordBridge from '../bridge/db/PasswordBridge.vue'

interface Props {
  owner: db.Owner
}
const props = defineProps<Props>()
const owner = toRef(props, 'owner')

const confirmSeconds = ref(10)
const confirmedSeconds = ref(0)
const password = ref('')

const emit = defineEmits<{(ev: 'done'): void,
  (ev: 'canceled'): void
}>()

const onCloseClick = () => {
  emit('canceled')
}

const onDoneClick = () => {
  emit('done')
}

</script>

<style scope lang='sass'>

</style>
