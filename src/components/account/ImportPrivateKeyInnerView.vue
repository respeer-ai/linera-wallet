<template>
  <div>
    <div v-html='$t("MSG_IMPORTED_ACCOUNT_WONT_BOUND_TO_MNEMONIC")' />
    <div class='vertical-sections-margin text-grey-8 text-bold'>
      {{ $t('MSG_ACCOUNT_NAME') }}
    </div>
    <div class='vertical-items-margin'>
      <q-input outlined dense v-model='accountName' />
    </div>
    <div class='vertical-items-margin text-grey-8 text-bold'>
      {{ $t('MSG_PRIVATE_KEY') }}
    </div>
    <div class='vertical-items-margin extra-margin-bottom'>
      <q-input outlined dense v-model='privateKey' :type='showPlainText ? "text" : "password"'>
        <template #append>
          <q-icon :name='showPlainText ? "bi-eye-fill" : "bi-eye-slash-fill"' class='cursor-pointer' @click='showPlainText = !showPlainText' />
        </template>
      </q-input>
    </div>
    <q-btn
      flat class='btn full-width vertical-items-margin' @click='onImportClick'
      no-caps :disable='privateKey.length === 0'
    >
      {{ $t('MSG_IMPORT') }}
    </q-btn>
    <q-btn
      flat class='btn btn-alt full-width vertical-items-margin' @click='onCancelClick'
      no-caps
    >
      {{ $t('MSG_CANCEL') }}
    </q-btn>
    <PasswordBridge ref='passwordBridge' v-model:password='password' />
    <GenerateKey ref='generateKey' />
    <OwnerBridge ref='ownerBridge' />
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { _hex } from 'src/utils'
import { localStore } from 'src/localstores'

import PasswordBridge from '../bridge/db/PasswordBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'
import GenerateKey from './GenerateKey.vue'

const privateKey = ref('')
const accountName = ref('')

const showPlainText = ref(false)
const password = ref(undefined as unknown as string)

const ownerBridge = ref<InstanceType<typeof OwnerBridge>>()
const generateKey = ref<InstanceType<typeof GenerateKey>>()

const emit = defineEmits<{(ev: 'imported'): void,
  (ev: 'canceled'): void
}>()

const onImportClick = async () => {
  try {
    const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey.value)))
    const publicKey = _hex.toHex(keyPair.public().to_bytes().bytes)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    await ownerBridge.value?.createOwner(publicKey, privateKey.value)
  } catch (error) {
    localStore.notification.pushNotification({
      Title: 'Import account',
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      Message: `Failed import account: ${error}.`,
      Popup: true,
      Type: localStore.notify.NotifyType.Error
    })
  }
  emit('imported')
}

const onCancelClick = () => {
  emit('canceled')
}

onMounted(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  accountName.value = await generateKey.value?.defaultAccountName() as string
})

</script>
