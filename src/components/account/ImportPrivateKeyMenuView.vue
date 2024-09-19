<template>
  <div>
    <div class='row vertical-menus-margin page-item-x-margin-left cursor-pointer' @click='onAddAccountClick'>
      <q-icon name='bi-plus-lg' size='20px' color='blue-10' />
      <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
        Create new account
      </div>
    </div>
    <div class='row vertical-sections-margin page-item-x-margin-left cursor-pointer' @click='onImportAccountClick'>
      <q-icon name='bi-box-arrow-in-down' size='20px' color='blue-10' />
      <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
        Import private key
      </div>
    </div>
    <div class='row vertical-sections-margin page-item-x-margin-left cursor-pointer' @click='onAddLedgerClick'>
      <q-icon name='bi-motherboard' size='20px' color='blue-10' />
      <div class='text-left text-blue-8 text-bold page-item-x-margin-left'>
        Add ledger
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>

const emit = defineEmits<{(ev: 'create'): void,
  (ev: 'import'): void,
  (ev: 'addLedger'): void
}>()

const onAddAccountClick = () => {
  emit('create')
}

const onImportAccountClick = () => {
  emit('import')
}

const onAddLedgerClick = () => {
  emit('addLedger')
}

</script>
