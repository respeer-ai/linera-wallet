<template>
  <div v-if='loading' class='row q-pa-md q-gutter-md'>
    <div :class='[ "text-center full-width onboarding-container", localStore.setting.extensionMode ? "" : "onboarding-padding" ]'>
      <q-img :src='cheCkoLogo' width='240px' />
      <ProcessingView :processing='loading' />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { dbBase } from '../../controller'
import { localStore } from 'src/localstores'
import { dbBridge } from 'src/bridge'

import ProcessingView from '../processing/ProcessingView.vue'

import cheCkoLogo from 'src/assets/CheCko.png'

const router = useRouter()
const route = useRoute()

const loading = ref(true)

onMounted(async () => {
  await dbBridge.DeviceFingerprint.initialize()
  const basePath = localStore.setting.basePath
  dbBase.passwords.toArray().then(async (passwords) => {
    loading.value = false
    const password = passwords.find((el) => el.active)
    if (password) {
      const timeout = await dbBridge.LoginTimestamp.loginTimeout()
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
