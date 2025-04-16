<template>
  <div>
    <span class='text-grey-9'>{{ $t('MSG_ACCOUNT_NAME') }}</span>
    <div class='vertical-items-margin'>
      <q-input dense outlined v-model='accountName' />
    </div>
    <q-btn
      flat class='btn full-width vertical-sections-margin' @click='onCreateClick'
      no-caps :disable='accountName.length === 0'
    >
      {{ $t('MSG_CREATE') }}
    </q-btn>
    <q-btn
      flat class='btn btn-alt full-width vertical-items-margin' @click='onCancelClick'
      no-caps
    >
      {{ $t('MSG_CANCEL') }}
    </q-btn>
    <GenerateKey ref='generateKey' />
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { dbBridge } from 'src/bridge'

import GenerateKey from './GenerateKey.vue'

const accountName = ref('')

const emit = defineEmits<{(ev: 'created'): void,
  (ev: 'canceled'): void
}>()

const generateKey = ref<InstanceType<typeof GenerateKey>>()

const onCreateClick = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const privateKeyHex = generateKey.value?.generateKey() as string
  await dbBridge.Owner.create(privateKeyHex, accountName.value)
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
