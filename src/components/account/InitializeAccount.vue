<template>
  <div class='text-center fill-parent'>
    <h5 class='text-brown-8' :style='{fontWeight: 600, margin: "16px"}'>
      Create account
    </h5>
    <div class='row' :style='{margin: "48px 0 0 0"}'>
      <q-space />
      <div v-if='publicKey.length' class='text-brown-10'>
        <div class='row'>
          <q-space />
          <div>
            <div class='row'>
              <span :style='{width: "160px"}' class='text-left'>Address</span>
              <span class='text-bold'>{{ shortid.shortId(publicKey, 20) }}</span>
              <q-icon
                name='content_copy' class='cursor-pointer' size='16px' :style='{margin: "2px 4px"}'
                @click='onCopyClick(publicKey)'
              />
            </div>
            <div class='row'>
              <span :style='{width: "160px"}' class='text-left'>Private Key</span>
              <span class='text-bold'>{{ shortid.shortId(account?.privateKey as string, 20) }}</span>
              <q-icon
                name='content_copy' size='16px' class='cursor-pointer' :style='{margin: "2px 4px"}'
                @click='onCopyClick(account?.privateKey as string)'
              />
            </div>
            <div class='row'>
              <span :style='{width: "160px"}' class='text-left'>Microchain</span>
              <span class='text-bold'>{{ shortid.shortId(chainId as string, 20) }}</span>
              <q-icon
                name='content_copy' size='16px' class='cursor-pointer' :style='{margin: "2px 4px"}'
                @click='onCopyClick(chainId as string)'
              />
            </div>
            <div class='row'>
              <span :style='{width: "160px"}' class='text-left'>Open Chain Message</span>
              <span class='text-bold'>{{ shortid.shortId(messageId as string, 20) }}</span>
              <q-icon
                name='content_copy' size='16px' class='cursor-pointer' :style='{margin: "2px 4px"}'
                @click='onCopyClick(messageId as string)'
              />
            </div>
          </div>
          <q-space />
        </div>
        <p class='text-brown-8' :style='{margin: "48px 0 0 0"}'>
          <q-icon name='info' class='text-blue-6' size='20px' />
          CheCko initialize a default account. You can backup this account to your local device.
          You can also recover this account with your password. You should understand if you lose your password,
          or account private key, CheCko isn't able to recover them.
        </p>
      </div>
      <q-card v-else :style='{height: "160px", width: "100%"}' flat>
        <q-inner-loading
          :showing='!publicKey.length'
          class='text-red-4'
        >
          <q-spinner-facebook size='80px' />
        </q-inner-loading>
      </q-card>
      <q-space />
    </div>
    <CreateAccount :auto-run='true' :password='password' v-model:public-key='publicKey' :check-exist='true' />
  </div>
</template>

<script setup lang="ts">
import { toRef, ref, computed } from 'vue'
import { wallet, notify } from 'src/localstores'
import { shortid } from 'src/utils'
import { copyToClipboard } from 'quasar'

import CreateAccount from 'src/components/account/CreateAccount.vue'

interface Props {
  password: string
}

const props = defineProps<Props>()
const password = toRef(props, 'password')
const publicKey = ref('')

const _wallet = wallet.useWalletStore()
const notification = notify.useNotificationStore()

const account = computed(() => _wallet.account(publicKey.value))
const chainId = computed(() => {
  if (!account.value?.microchains?.size) {
    return undefined
  }
  return Array.from(account.value?.microchains?.keys())[0]
})
const messageId = computed(() => account.value?.microchains?.get(chainId.value as string)?.message_id)

const onCopyClick = (content: string) => {
  copyToClipboard(content)
    .then(() => {
      notification.pushNotification({
        Title: 'Copy',
        Message: `Success copy ${content} to clipboard.`,
        Popup: true,
        Type: notify.NotifyType.Info
      })
    })
    .catch((e) => {
      console.log('Fail copy', e)
    })
}

</script>
