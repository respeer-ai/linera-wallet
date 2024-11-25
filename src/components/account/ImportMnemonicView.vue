<template>
  <div class='fill-parent text-center onboarding-content'>
    <h5 class='onboarding-page-title' v-html='$t("MSG_ACCESS_YOUR_WALLET_WITH_SECRET_RECOVERY_PHRASE")' />
    <div v-html='$t("MSG_CHECKO_CANNOT_RECOVERY_YOUR_WALLET")' />
    <div class='text-left full-width tip info info-bg text-grey-8 row vertical-sections-margin'>
      <q-icon name='bi-info-circle-fill' color='green-4' size='20px' />
      <div class='page-item-x-margin-left' :style='{width: "calc(100% - 26px)"}'>
        {{ $t('MSG_PASTE_RECOVERY_PHRASE_INTO_ANY_FIELD') }}
      </div>
    </div>
    <div class='row vertical-sections-margin'>
      <div
        v-for='(word, i) in mnemonic'
        :key='i'
        :class='[ "mnemonic-grid", i % 5 === 0 ? "mnemonic-grid-start" : "", i < 5 ? "mnemonic-grid-top" : "" ]'
      >
        <q-input
          borderless dense
          hide-bottom-space
          v-model='mnemonic[i]'
          :autofocus='i === focusIndex'
          @paste='(evt) => onPaste(i, evt)'
          @focus='() => onFocus(i)'
        />
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

const mnemonic = defineModel<string[]>({
  default: [
    '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', ''
  ] as string[]
})
const focusIndex = ref(0)

const onFocus = (index: number) => {
  focusIndex.value = index
}

const onPaste = (index: number, evt: {
  preventDefault(): unknown; clipboardData: { getData: (arg0: string) => string; };
}) => {
  evt.preventDefault()
  const _mnemonic = mnemonic.value
  const copied = evt.clipboardData.getData('text').split(/(\s+)/).filter((v) => v.trim().length > 0)
  if (copied.length === 1) {
    _mnemonic[index] = copied[0]
  } else {
    copied.forEach((v, i) => {
      if (i < _mnemonic.length) _mnemonic[i] = v
    })
  }
  mnemonic.value = [..._mnemonic]
}

</script>
