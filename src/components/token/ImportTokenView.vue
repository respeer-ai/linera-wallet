<template>
  <div class='page-x-padding'>
    <div>
      {{ $t('MSG_CAN_IMPORT_ERC20_COMPATIBLE_TOKEN') }}
    </div>
    <div class='text-bold vertical-sections-margin'>
      {{ $t('MSG_APPLICATION_ID') }}
    </div>
    <q-input
      outlined v-model='applicationId' type='textarea' :error='applicationIdError'
      autogrow hide-bottom-space class='vertical-items-margin'
    />
    <div class='vertical-sections-margin tip warn-bg warn row'>
      <q-icon name='bi-exclamation-triangle-fill' color='red-8' size='24px' />
      <div class='tip-text page-item-x-margin-left'>
        {{ $t('MSG_SHOULD_CONFIRM_IMPORT_RIGHT_APPLICATION') }}
      </div>
    </div>
    <q-btn
      class='btn vertical-sections-margin full-width' flat no-caps
      @click='onImportClick' :disabled='!canImport' :loading='importing'
    >
      {{ $t('MSG_IMPORT') }}
    </q-btn>
    <q-btn
      class='btn btn-alt vertical-items-margin extra-margin-bottom full-width' flat no-caps
      @click='onCancelClick'
    >
      {{ $t('MSG_CANCEL') }}
    </q-btn>
  </div>
</template>

<script setup lang='ts'>
import { computed, ref } from 'vue'
import { rpcBridge } from 'src/bridge'
import { localStore } from 'src/localstores'

const applicationId = ref('')
const applicationIdError = ref(false)
const importing = ref(false)

const canImport = computed(() => {
  return applicationId.value.length > 0
})

const emit = defineEmits<{(ev: 'imported'): void,
  (ev: 'error'): void,
  (ev: 'canceled'): void
}>()

const onImportClick = async () => {
  applicationIdError.value = applicationId.value.length === 0
  if (applicationIdError.value) return

  importing.value = true
  localStore.setting.TokensImportState = localStore.settingDef.TokensImportState.TokensImporting

  try {
    await rpcBridge.MemeApplicationOperation.persistApplication(applicationId.value)
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Failed import erc20 application: ${e}`)
  }

  importing.value = false
  localStore.setting.TokensImportState = localStore.settingDef.TokensImportState.TokensImported

  emit('imported')
}

const onCancelClick = () => {
  emit('canceled')
}

</script>
