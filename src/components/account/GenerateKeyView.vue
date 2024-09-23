<template>
  <div>
    <span class='text-grey-9'>Account name</span>
    <div class='vertical-items-margin'>
      <q-input dense outlined v-model='accountName' />
    </div>
    <q-btn
      flat class='btn full-width vertical-sections-margin' @click='onCreateClick'
      no-caps :disable='accountName.length === 0'
    >
      Create
    </q-btn>
    <q-btn
      flat class='btn btn-alt full-width vertical-items-margin' @click='onCancelClick'
      no-caps
    >
      Cancel
    </q-btn>
    <GenerateKey ref='generateKey' />
    <OwnerBridge ref='ownerBridge' />
  </div>
</template>

<script setup lang='ts'>
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { onMounted, ref } from 'vue'
import { _hex } from 'src/utils'

import GenerateKey from './GenerateKey.vue'
import OwnerBridge from '../bridge/db/OwnerBridge.vue'

const accountName = ref('')

const emit = defineEmits<{(ev: 'created'): void,
  (ev: 'canceled'): void
}>()

const generateKey = ref<InstanceType<typeof GenerateKey>>()
const ownerBridge = ref<InstanceType<typeof OwnerBridge>>()

const onCreateClick = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const privateKey = generateKey.value?.generateKey() as string
  const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey)))
  const publicKey = _hex.toHex(keyPair.public().to_bytes().bytes)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await ownerBridge.value?.createOwner(publicKey, privateKey, accountName.value)
  emit('created')
}

const onCancelClick = () => {
  emit('canceled')
}

onMounted(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  accountName.value = await generateKey.value?.defaultAccountName() as string
})

</script>
