<template>
  <div class='text-center fill-parent'>
    <h5 class='onboarding-page-title'>
      Write down your Secret<br>Recovery Phrase
    </h5>
    <p>
      Write donw this 24-words Secret Recovery Phrase and save it in a place that you trust and only you can access.
    </p>
    <div class='text-left text-bold' :style='{paddingLeft: "20px"}'>
      Tips:
    </div>
    <ul class='text-left' :style='{marginTop: "8px"}'>
      <li>Save in a password manager</li>
      <li>Store in a safe deposit box</li>
      <li>Write down and store in multiple secret places</li>
    </ul>
    <q-card dark :style='{height: "160px", marginTop: "24px"}' class='flex items-center justify-center'>
      <div v-if='showMnemonic'>
        {{ mnemonic }}
      </div>
      <div v-else>
        <q-icon name='bi-eye' size='20px' />
        <div :style='{marginTop: "16px", fontSize: "12px"}'>
          Make sure nobody is looking.
        </div>
      </div>
    </q-card>
    <div class='onboarding-padding' :style='{marginTop: "24px"}'>
      <q-btn
        flat
        label='Reveal Secret Recovery Phrase'
        class='btn'
        no-caps
        @click='showMnemonic = !showMnemonic'
      />
    </div>
    <GenerateKey
      :password='password'
      v-model:mnemonic='mnemonic'
      v-model:private-key='privateKey'
      v-model:public-key='publicKey'
    />
  </div>
</template>

<script setup lang="ts">
import { toRef, ref, onMounted } from 'vue'
// import { notify } from 'src/localstores'
// import { copyToClipboard } from 'quasar'

import GenerateKey from './GenerateKey.vue'

interface Props {
  password: string
}

const props = defineProps<Props>()
const password = toRef(props, 'password')

const showInnerActionBtn = defineModel<boolean>('showInnerActionBtn')

const publicKey = ref('')
const privateKey = ref('')
const mnemonic = ref('')
const showMnemonic = ref(false)

// const notification = notify.useNotificationStore()

/*
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
*/

onMounted(() => {
  showInnerActionBtn.value = true
})

</script>
