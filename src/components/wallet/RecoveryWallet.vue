<template>
  <div class='text-center onboarding-container shadow-1 onboarding-padding'>
    <LoginPassword v-model:password='password' @unlocked='unlocked' />
    <LoginTimestampBridge ref='loginTimestampBridge' />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import LoginPassword from '../password/LoginPassword.vue'
import LoginTimestampBridge from '../bridge/db/LoginTimestampBridge.vue'

const loginTimestampBridge = ref<InstanceType<typeof LoginTimestampBridge>>()

const password = ref('')

const router = useRouter()

const unlocked = async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await loginTimestampBridge.value?.saveLoginTimestamp()
  void router.push({ path: '/home' })
}

</script>
