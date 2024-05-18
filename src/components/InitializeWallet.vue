<template>
  <div class='text-center'>
    <q-stepper
      flat
      v-model='step'
      active-color='brown-8'
      inactive-color='brown-4'
      done-color='green-6'
      animated
      alternative-labels
    >
      <q-step
        :name='1'
        title='Create Password'
        :done='step > 1'
      >
        <NewPassword v-model:password='password' v-model:error='passwordError' />
      </q-step>
      <q-step
        :name='2'
        title='Create Account'
        :done='step > 2'
      >
        <InitializeAccount :password='password' />
      </q-step>
      <q-step
        :name='3'
        title='Backup Account'
        :done='step > 3'
      >
        HHHHHHHHHHH
      </q-step>
    </q-stepper>
    <q-btn
      flat
      class='text-brown-10 bg-red-2'
      :style='{borderRadius: "16px", width: "400px", margin: "16px 0 0 0"}'
      :label='btnText'
      :disable='!canGotoNext()'
      @click='onNextStepClick'
    />
  </div>
</template>

<script setup lang='ts'>
import { ref, computed } from 'vue'
import { wallet } from 'src/localstores'

import NewPassword from 'src/components/NewPassword.vue'
import InitializeAccount from './InitializeAccount.vue'

const step = ref(1)
const password = ref('')
const passwordError = ref(false)
const _wallet = wallet.useWalletStore()

const canGotoNext = () => {
  switch (step.value) {
    case 1:
      return !passwordError.value && password.value.length
    default:
      return true
  }
}

const btnText = computed(() => {
  switch (step.value) {
    case 1:
      return 'Create Account'
    case 2:
      return 'Export Account'
  }
  return 'Next'
})

const savePassword = () => {
  _wallet.savePassword(password.value, () => {
    step.value++
  })
}

const onNextStepClick = () => {
  switch (step.value) {
    case 1:
      savePassword()
      break
    case 2:

      break
  }
}

</script>
