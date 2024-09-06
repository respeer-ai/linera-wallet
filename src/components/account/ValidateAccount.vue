<template>
  <div class='fill-parent text-center'>
    <h5 class='onboarding-page-title'>
      Validate secret recovery phrase
    </h5>
    <q-card
      flat bordered :style='{height: "160px", marginTop: "24px", padding: "24px"}'
      class='flex items-center justify-center'
    >
      <div class='row'>
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
    </q-card>
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
