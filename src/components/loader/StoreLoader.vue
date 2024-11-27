<template>
  <div v-if='loading' class='row q-pa-md q-gutter-md'>
    <div :class='[ "text-center full-width onboarding-container", localStore.setting.extensionMode ? "" : "onboarding-padding" ]'>
      <q-img :src='cheCkoLogo' width='240px' />
      <ProcessingView :processing='loading' />
    </div>
    <PasswordBridge />
    <LoginTimestampBridge ref='loginTimestampBridge' />
    <DeviceFingerPrintBridge ref='deviceFingerPrintBridge' />
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dbBase } from '../../controller'
import { localStore } from 'src/localstores'

import PasswordBridge from '../bridge/db/PasswordBridge.vue'
import LoginTimestampBridge from '../bridge/db/LoginTimestampBridge.vue'
import ProcessingView from '../processing/ProcessingView.vue'
import DeviceFingerPrintBridge from '../bridge/db/DeviceFingerPrintBridge.vue'

import cheCkoLogo from 'src/assets/CheCko.png'

const router = useRouter()
const route = useRoute()

const loading = ref(true)

const loginTimestampBridge = ref<InstanceType<typeof LoginTimestampBridge>>()
const deviceFingerPrintBridge = ref<InstanceType<typeof DeviceFingerPrintBridge>>()

onMounted(async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await deviceFingerPrintBridge.value?.initialize()
  const basePath = localStore.setting.basePath
  dbBase.passwords.toArray().then(async (passwords) => {
    loading.value = false
    const password = passwords.find((el) => el.active)
    if (password) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const timeout = await loginTimestampBridge.value?.loginTimeout()
      const targetPath = route.path === basePath
        ? localStore.setting.formalizePath('/home')
        : localStore.setting.formalizePath(route.path)
      if (timeout) {
        return void router.push({
          path: localStore.setting.formalizePath('/recovery'),
          query: {
            target: targetPath
          }
        })
      }
      return void router.push({ path: targetPath })
    }
    void router.push({ path: localStore.setting.formalizePath('/onboarding') })
  }).catch(() => {
    loading.value = false
    void router.push({ path: localStore.setting.formalizePath('/onboarding') })
  })
})
</script>
