<template>
  <div :class='[ "text-center onboarding-container shadow-1", localStore.setting.extensionMode ? "" : "onboarding-padding" ]'>
    <LoginPassword v-model:password='password' @unlocked='unlocked' />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { localStore } from 'src/localstores'

import LoginPassword from '../password/LoginPassword.vue'
import { dbBridge } from 'src/bridge'

interface Query {
  target: string
}

const password = ref('')

const router = useRouter()
const route = useRoute()

const targetPath = ref((route.query as unknown as Query).target)

const unlocked = async () => {
  await dbBridge.LoginTimestamp.save()
  void router.push({ path: targetPath.value || localStore.setting.formalizePath('/home') })
}

</script>
