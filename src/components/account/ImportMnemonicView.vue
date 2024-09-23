<template>
  <div class='fill-parent text-center'>
    <h5 class='onboarding-page-title'>
      Access your wallet with secret recovery phrase
    </h5>
    <div>
      CheCko cannot recover your password. We will use your secret recovery phrase to validate your ownership, restore your wallet and setup a new password.
    </div>
    <div class='text-left full-width tip info info-bg text-grey-8 row vertical-sections-margin'>
      <q-icon name='bi-info-circle-fill' color='green-4' size='20px' />
      <div class='page-item-x-margin-left' :style='{width: "calc(100% - 26px)"}'>
        You can paste your secret recovery phrase into any field.
      </div>
    </div>
    <div class='row vertical-sections-margin'>
      <div v-for='(word, i) in mnemonic' :key='word' :class='[ "mnemonic-grid", i % 5 === 0 ? "mnemonic-grid-start" : "", i < 5 ? "mnemonic-grid-top" : "" ]'>
        <q-input
          borderless dense
          hide-bottom-space
          v-model='mnemonic[i]'
          :autofocus='i === 0'
          @paste='onPaste'
        />
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>

const mnemonic = defineModel<string[]>({
  default: [
    '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', ''
  ] as string[]
})

const onPaste = (evt: {
  preventDefault(): unknown; clipboardData: { getData: (arg0: string) => string; };
}) => {
  evt.preventDefault()
  const _mnemonic = [
    '', '', '', '', '', '', '', '', '', '', '', '',
    '', '', '', '', '', '', '', '', '', '', '', ''
  ] as string[]
  evt.clipboardData.getData('text').split(/(\s+)/).filter((v) => v.trim().length > 0).forEach((v, i) => {
    if (i < _mnemonic.length) _mnemonic[i] = v
  })
  mnemonic.value = [..._mnemonic]
}

</script>
