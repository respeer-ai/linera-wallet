<template>
  <div class='text-center onboarding-container shadow-1 onboarding-padding'>
    <LoginPassword v-model:password='password' @unlocked='unlocked' />
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import LoginPassword from 'src/components/password/LoginPassword.vue'

const password = ref('')

const router = useRouter()

const unlocked = () => {
  void router.push({ path: '/home' })
}

</script>
