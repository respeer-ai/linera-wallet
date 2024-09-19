<template>
  <div>
    <div>
      Imported account won't be bound to current mnemonic.
    </div>
    <div class='vertical-sections-margin text-grey-8 text-bold'>
      Private key
    </div>
    <div class='vertical-items-margin'>
      <q-input outlined dense v-model='privateKey' :type='showPlainText ? "text" : "password"'>
        <template #append>
          <q-icon :name='showPlainText ? "bi-eye-fill" : "bi-eye-slash-fill"' class='cursor-pointer' @click='showPlainText = !showPlainText' />
        </template>
      </q-input>
    </div>
    <q-btn
      flat dense class='btn full-width vertical-sections-margin' @click='onImportClick'
      no-caps :disable='privateKey.length === 0'
    >
      Import
    </q-btn>
    <q-btn
      flat dense class='btn btn-alt full-width vertical-items-margin' @click='onCancelClick'
      no-caps
    >
      Cancel
    </q-btn>
    <PasswordBridge ref='passwordBridge' v-model:password='password' />
    <OwnerBridge ref='ownerBridge' />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { _hex } from 'src/utils'
import { localStore } from 'src/localstores'

import PasswordBridge from '../bridge/db/PasswordBridge.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'

const privateKey = ref('')
const showPlainText = ref(false)
const password = ref(undefined as unknown as string)

const ownerBridge = ref<InstanceType<typeof OwnerBridge>>()

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

</script>
