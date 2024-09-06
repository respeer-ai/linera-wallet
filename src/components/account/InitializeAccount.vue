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
    <q-card
      flat bordered :dark='!showMnemonic' :style='{height: "160px", marginTop: "24px", padding: "24px"}'
      class='flex items-center justify-center'
    >
      <div v-if='showMnemonic' class='row'>
        <div v-for='(word, i) in mnemonicWords' :key='word' :class='[ "mnemonic-grid", i % 5 === 0 ? "mnemonic-grid-start" : "", i < 5 ? "mnemonic-grid-top" : "" ]'>
          {{ word }}
        </div>
      </div>
      <div v-else>
        <q-icon name='bi-eye' size='20px' />
        <div :style='{marginTop: "16px", fontSize: "12px"}'>
          Make sure nobody is looking.
        </div>
      </div>
    </q-card>
    <div class='onboarding-padding' :style='{marginTop: "32px"}' v-if='showInnerActionBtn'>
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
import { toRef, ref, onMounted, computed, watch } from 'vue'

import GenerateKey from './GenerateKey.vue'

interface Props {
  password: string
}

const props = defineProps<Props>()
const password = toRef(props, 'password')

const showInnerActionBtn = defineModel<boolean>('showInnerActionBtn')
const mnemonic = defineModel<string>('mnemonic')

const publicKey = ref('')
const privateKey = ref('')
const mnemonicWords = computed(() => mnemonic.value?.split(' '))
const showMnemonic = ref(false)

watch(showMnemonic, () => {
  showInnerActionBtn.value = !showMnemonic.value
})

onMounted(() => {
  showInnerActionBtn.value = true
})

</script>
