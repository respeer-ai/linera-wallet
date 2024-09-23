<template>
  <div v-if='loading' class='row q-pa-md q-gutter-md'>
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
    <LoginTimestampBridge ref='loginTimestampBridge' />
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dbBase } from '../../controller'

import PasswordBridge from '../bridge/db/PasswordBridge.vue'
import LoginTimestampBridge from '../bridge/db/LoginTimestampBridge.vue'

import cheCkoLogo from 'src/assets/CheCko.png'

const router = useRouter()
const route = useRoute()

const loading = ref(true)

const loginTimestampBridge = ref<InstanceType<typeof LoginTimestampBridge>>()

onMounted(() => {
  dbBase.passwords.toArray().then(async (passwords) => {
    loading.value = false
    const password = passwords.find((el) => el.active)
    if (password) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const timeout = await loginTimestampBridge.value?.loginTimeout()
      if (timeout) {
        return void router.push({ path: '/recovery' })
      }
      return void router.push({ path: route.path === '/' ? '/home' : route.path })
    }
    void router.push({ path: '/onboarding' })
  }).catch(() => {
    loading.value = false
    void router.push({ path: '/onboarding' })
  })
})
</script>
