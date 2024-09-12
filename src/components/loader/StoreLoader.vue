<template>
  <div class='row q-pa-md q-gutter-md onboarding-container shadow-1'>
    <q-space />
    <div class='text-center'>
      <q-img :src='cheCkoLogo' width='240px' />
      <q-card :style='{height: "160px", width: "600px", maxWidth: "95%"}' flat>
        <q-inner-loading
          :showing='loading'
          class='text-red-4'
        >
          <q-spinner-facebook size='80px' />
        </q-inner-loading>
      </q-card>
    </div>
    <q-space />
    <PasswordBridge />
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { dbBase } from '../../controller'

import PasswordBridge from '../bridge/db/PasswordBridge.vue'

import cheCkoLogo from 'src/assets/CheCko.png'

const router = useRouter()
const loading = ref(true)

onMounted(() => {
  dbBase.passwords.toArray().then((passwords) => {
    loading.value = false
    passwords.find((el) => el.active)
      ? void router.push({ path: '/recovery' })
      : void router.push({ path: '/onboarding' })
  }).catch((e) => {
    loading.value = false
    console.log('Fail load password', e)
  })
})
</script>
