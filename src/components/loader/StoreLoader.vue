<template>
  <div class='row q-pa-md q-gutter-md'>
    <div class='text-center full-width onboarding-container'>
      <q-img :src='cheCkoLogo' width='240px' />
      <q-card class='loading-card' flat>
        <q-inner-loading
          :showing='loading'
          class='text-red-4'
        >
          <q-spinner-facebook size='80px' />
        </q-inner-loading>
      </q-card>
    </div>
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
  }).catch(() => {
    loading.value = false
    void router.push({ path: '/onboarding' })
  })
})
</script>
