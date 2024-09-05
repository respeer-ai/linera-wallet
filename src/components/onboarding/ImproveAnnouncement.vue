<template>
  <div class='fill-parent onboarding-container shadow-1 onboarding-padding'>
    <h5 class='onboarding-page-title text-center'>
      Help us improve CheCko
    </h5>
    <p class='text-left'>
      We'd like to gather user feed back to improve metamask. But we won't submit any user data to any centralized server. If you find any issue when you're using CheCko, you can create issue to our github repository, of contact CheCko team through discord or telegram.
    </p>
    <p>
      <a href='https://github.com/respeer-ai/linera-wallet/README.md'>Learn how to create an issue while using CheCko.</a>
    </p>
    <p>
      When you start to create an issue to CheCko, we think of you understand you shall obey CheCko community rules.
    </p>
    <div class='row'>
      <q-space />
      <div class='onboarding-btns row'>
        <q-btn
          flat
          label='I understand'
          class='text-brown-8 bg-red-2 btn vertical-items-margin'
          @click='onAnyBtnClick'
          no-caps
        />
      </div>
      <q-space />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Query {
  target: string
}

const route = useRoute()
const target = ref((route.query as unknown as Query).target)

const router = useRouter()

const onAnyBtnClick = () => {
  void router.push({ path: target.value })
}

</script>
