<template>
  <div class='text-center fill-parent'>
    <h5 class='onboarding-page-title' v-html='$t("MSG_WRITE_DOWN_RECOVERY_PHRASE")' />
    <p v-html='$t("MSG_WRITE_DOWN_24_WORDS_RECOVERY_PHRASE_AND_SAVE_IT")' />
    <div class='text-left text-bold vertical-sections-margin' :style='{paddingLeft: "20px"}'>
      {{ $t('MSG_TIPS') }}{{ $t('MSG_COLON') }}
    </div>
    <ul class='text-left' :style='{marginTop: "8px"}'>
      <li>{{ $t('MSG_SAVE_IN_A_PASSWORD_MANAGER') }}</li>
      <li>{{ $t('MSG_STORE_IN_A_SAFE_DEPOSIT_BOX') }}</li>
      <li>{{ $t('MSG_WRITE_DOWN_AND_STORE_IN_MULTIPLE_SECRET_PLACES') }}</li>
    </ul>
    <div v-if='showMnemonic' class='vertical-sections-margin'>
      <div class='row'>
        <div class='text-bold'>
          {{ $t('MSG_MNEMONIC') }}
        </div>
        <q-space />
        <div class='text-blue-6 cursor-pointer label-text-small' @click='showMnemonic = false'>
          {{ $t('MSG_HIDE') }}
        </div>
      </div>
      <div class='row vertical-items-margin'>
        <div v-for='(word, i) in mnemonicWords' :key='word' :class='[ "mnemonic-grid", i % 5 === 0 ? "mnemonic-grid-start" : "", i < 5 ? "mnemonic-grid-top" : "" ]'>
          {{ word }}
        </div>
      </div>
    </div>
    <q-card bordered flat v-else class='page-y-padding vertical-sections-margin bg-grey-9'>
      <q-icon name='bi-eye' size='20px' color='white' class='vertical-sections-margin' />
      <div class='text-white vertical-items-margin label-text-small extra-margin-bottom'>
        {{ $t('MSG_MAKE_SURE_NOBODY_IS_LOOKING') }}
      </div>
    </q-card>
    <div class='full-width vertical-sections-margin' v-if='showInnerActionBtn'>
      <q-btn
        flat
        label='Reveal secret recovery phrase'
        class='btn full-width vertical-menus-margin'
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
import { toRef, ref, onMounted, computed, watch } from 'vue'

import GenerateKey from './GenerateKey.vue'

interface Props {
  password: string
}

const props = defineProps<Props>()
const password = toRef(props, 'password')

const showInnerActionBtn = defineModel<boolean>('showInnerActionBtn')
const mnemonic = defineModel<string>('mnemonic')
const publicKey = defineModel<string>('publicKey')
const privateKey = defineModel<string>('privateKey')

const mnemonicWords = computed(() => mnemonic.value?.split(' '))
const showMnemonic = ref(false)

watch(showMnemonic, () => {
  showInnerActionBtn.value = !showMnemonic.value
})

onMounted(() => {
  showInnerActionBtn.value = true
})

</script>
