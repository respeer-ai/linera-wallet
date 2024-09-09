<template>
  <div class='text-center full-width'>
    <h5 class='text-brown-8' :style='{fontWeight: 600, margin: "16px"}'>
      Initialize Account
    </h5>
    <div class='row' :style='{margin: "24px 0 0 0", width: "100%"}'>
      <q-space />
      <div v-if='publicKey.length' class='text-brown-10'>
        <div class='text-left'>
          Address
        </div>
        <div class='text-bold text-left row'>
          <span>{{ shortid.shortId(publicKey, 16) }}</span>
          <q-icon
            name='content_copy' class='cursor-pointer' size='16px' :style='{margin: "2px 4px"}'
            @click='onCopyClick(publicKey)'
          />
        </div>
        <div class='text-left' :style='{margin: "8px 0 0 0"}'>
          Private Key
        </div>
        <div class='text-bold text-left row'>
          <span>{{ shortid.shortId(account?.privateKey as string, 16) }}</span>
          <q-icon
            name='content_copy' size='16px' class='cursor-pointer' :style='{margin: "2px 4px"}'
            @click='onCopyClick(account?.privateKey as string)'
          />
        </div>
        <div class='text-left' :style='{margin: "8px 0 0 0"}'>
          Microchain
        </div>
        <div class='text-bold text-left row'>
          <span>{{ shortid.shortId(chainId as string, 16) }}</span>
          <q-icon
            name='content_copy' size='16px' class='cursor-pointer' :style='{margin: "2px 4px"}'
            @click='onCopyClick(chainId as string)'
          />
        </div>
        <div class='text-left' :style='{margin: "8px 0 0 0"}'>
          Open Chain Message
        </div>
        <div class='text-bold'>
          <span>{{ shortid.shortId(messageId as string, 16) }}</span>
          <q-icon
            name='content_copy' size='16px' class='cursor-pointer' :style='{margin: "2px 4px"}'
            @click='onCopyClick(messageId as string)'
          />
        </div>
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
import { localStore } from 'src/localstores'
import { shortid } from 'src/utils'
import { copyToClipboard } from 'quasar'

import CreateAccount from 'src/components/account/CreateAccount.vue'

interface Props {
  password: string
}

const props = defineProps<Props>()
const password = toRef(props, 'password')
const publicKey = ref('')

const account = computed(() => localStore.wallet.account(publicKey.value))
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
      localStore.notification.pushNotification({
        Title: 'Copy',
        Message: `Success copy ${content} to clipboard.`,
        Popup: true,
        Type: localStore.notify.NotifyType.Info
      })
    })
    .catch((e) => {
      console.log('Fail copy', e)
    })
}

</script>
