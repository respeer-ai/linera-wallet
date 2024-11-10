<template>
  <div class='fill-parent text-center'>
    <h5 class='onboarding-page-title'>
      {{ $t('MSG_VALIDATE_SECRET_RECOVERY_PHRASE') }}
    </h5>
    <div>
      {{ $t('MSG_FILL_RIGHT_MNEMONIC_INTO_EMPTY_FIELDS') }}
    </div>
    <div class='text-left text-bold vertical-sections-margin' :style='{paddingLeft: "20px"}'>
      {{ $t('MSG_TIPS') }}{{ $t('MSG_COLON') }}
    </div>
    <ul class='text-left' :style='{marginTop: "8px"}'>
      <li>{{ $t('MSG_DONT_SAVE_MNEMONIC_PROPERLY_SAFE_TO_CREATE_NEW') }}</li>
    </ul>
    <div class='row vertical-sections-margin'>
      <div v-for='(word, i) in mnemonicPartialWords' :key='word' :class='[ "mnemonic-grid", i % 5 === 0 ? "mnemonic-grid-start" : "", i < 5 ? "mnemonic-grid-top" : "" ]'>
        <div v-if='!blankIndexes.includes(i)'>
          {{ word }}
        </div>
        <q-input
          v-else borderless dense
          hide-bottom-space input-class='blank-text'
          v-model='shadowMnemonicWords[i]'
        />
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { computed, ref, toRef, watch } from 'vue'

interface Props {
  mnemonic: string
}

const props = defineProps<Props>()
const mnemonic = toRef(props, 'mnemonic')
const mnemonicWords = computed(() => mnemonic.value.split(' '))
const blankIndexes = computed(() => [
  Math.floor(Math.random() * mnemonicWords.value.length),
  Math.floor(Math.random() * mnemonicWords.value.length),
  Math.floor(Math.random() * mnemonicWords.value.length),
  Math.floor(Math.random() * mnemonicWords.value.length),
  Math.floor(Math.random() * mnemonicWords.value.length),
  Math.floor(Math.random() * mnemonicWords.value.length),
  Math.floor(Math.random() * mnemonicWords.value.length)
].filter((el, i) => i % 2 === 0).slice(0, 3))
const mnemonicPartialWords = ref(Array.from(mnemonicWords.value).map((el, i) => blankIndexes.value.includes(i) ? '' : el))
const shadowMnemonicWords = ref(Array.from(mnemonicPartialWords.value))

const valid = defineModel<boolean>()
watch(() => [shadowMnemonicWords.value[blankIndexes.value[0]], shadowMnemonicWords.value[blankIndexes.value[1]], shadowMnemonicWords.value[blankIndexes.value[2]]], () => {
  valid.value = shadowMnemonicWords.value[blankIndexes.value[0]] === mnemonicWords.value[blankIndexes.value[0]] &&
                shadowMnemonicWords.value[blankIndexes.value[1]] === mnemonicWords.value[blankIndexes.value[1]] &&
                shadowMnemonicWords.value[blankIndexes.value[2]] === mnemonicWords.value[blankIndexes.value[2]]
})

</script>
