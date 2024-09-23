<template>
  <q-card class='selector-card'>
    <div class='page-x-padding'>
      <div class='row'>
        <q-space />
        <p class='text-center text-bold text-grey-9 selector-title'>
          Protect private key
        </p>
        <q-space />
        <q-icon name='bi-x' size='24px' class='cursor-pointer' @click='onCloseClick' />
      </div>
      <div class='vertical-menus-margin'>
        <p>This private key provide <strong>full permissions</strong> to its account assets.</p>
        <p><strong>Please never share private key to anyone else.</strong> CheCko support team won't require to provide those information.</p>
        <p><strong class='text-blue-8'>But, phishing users use it to steal your assets!</strong></p>
      </div>
      <div class='vertical-sections-margin'>
        <q-btn
          :loading='confirmedSeconds > 0 && confirmedSeconds < confirmSeconds'
          :percentage='confirmedSeconds * 100 / confirmSeconds'
          flat class='btn full-width' label='Long press to show private key'
          no-caps
          v-touch-repeat.mouse='onConfirmClick'
          @mouseup='onConfirmCanceled'
        >
          <template #loading>
            <q-spinner-gears class='on-left' />
            Confirming
          </template>
        </q-btn>
      </div>
    </div>
  </q-card>
</template>

<script setup lang='ts'>
import { ref } from 'vue'

const confirmSeconds = ref(10)
const confirmedSeconds = ref(0)

const emit = defineEmits<{(ev: 'canceled'): void,
  (ev: 'confirmed'): void
}>()

const onCloseClick = () => {
  emit('canceled')
}

const onConfirmClick = () => {
  confirmedSeconds.value++
  if (confirmSeconds.value === confirmedSeconds.value) {
    emit('confirmed')
  }
}

const onConfirmCanceled = () => {
  confirmedSeconds.value = 0
}

</script>

<style scope lang='sass'>

</style>
