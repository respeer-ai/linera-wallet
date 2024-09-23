<template>
  <div class='text-center fill-parent'>
    <h5 class='onboarding-page-title'>
      Write down your Secret<br>Recovery Phrase
    </h5>
    <p>
      Write donw this 24-words Secret Recovery Phrase and save it in a place that you trust and only you can access.
    </p>
    <div class='text-left text-bold vertical-sections-margin' :style='{paddingLeft: "20px"}'>
      Tips:
    </div>
    <ul class='text-left' :style='{marginTop: "8px"}'>
      <li>Save in a password manager</li>
      <li>Store in a safe deposit box</li>
      <li>Write down and store in multiple secret places</li>
    </ul>
    <div v-if='showMnemonic' class='vertical-sections-margin'>
      <div class='row'>
        <div class='text-bold'>
          Mnemonic
        </div>
        <q-space />
        <div class='text-blue-6 cursor-pointer label-text-small' @click='showMnemonic = false'>
          Hide
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
        Make sure nobody is looking.
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
