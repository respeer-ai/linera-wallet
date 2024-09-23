<template>
  <div class='fill-parent text-center'>
    <h5 class='onboarding-page-title'>
      Validate secret recovery phrase
    </h5>
    <div>
      Fill right mnemonic into empty fields to confirm you already properly backup mnemonic.
    </div>
    <div class='text-left text-bold vertical-sections-margin' :style='{paddingLeft: "20px"}'>
      Tips:
    </div>
    <ul class='text-left' :style='{marginTop: "8px"}'>
      <li>If you don't save mnemonic properly, it's safe to create a new one and discard the this one at this step.</li>
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
