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
      <q-input outlined dense v-model='privateKeyHex' :type='showPlainText ? "text" : "password"'>
        <template #append>
          <q-icon :name='showPlainText ? "bi-eye-fill" : "bi-eye-slash-fill"' class='cursor-pointer' @click='showPlainText = !showPlainText' />
        </template>
      </q-input>
    </div>
    <q-btn
      flat class='btn full-width vertical-items-margin' @click='onImportClick'
      no-caps :disable='privateKeyHex.length === 0'
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
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { localStore } from 'src/localstores'
import { dbBridge } from 'src/bridge'

import PasswordBridge from '../bridge/db/PasswordBridge.vue'
import GenerateKey from './GenerateKey.vue'

const privateKeyHex = ref('')
const accountName = ref('')

const showPlainText = ref(false)
const password = ref(undefined as unknown as string)

const generateKey = ref<InstanceType<typeof GenerateKey>>()

const emit = defineEmits<{(ev: 'imported'): void,
  (ev: 'canceled'): void
}>()

const onImportClick = async () => {
  try {
    await dbBridge.Owner.create(privateKeyHex.value, accountName.value, password.value)
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
