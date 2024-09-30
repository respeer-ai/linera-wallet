<template>
  <div>
    <div :class='[ "onboarding-container", localStore.setting.extensionMode ? "page-x-padding" : "onboarding-padding" ]'>
      <h5 class='onboarding-page-title text-center'>
        Help us improve CheCko
      </h5>
      <div class='text-left vertical-sections-margin'>
        We'd like to gather user feed back to improve metamask. But we won't submit any user data to any centralized server. If you find any issue when you're using CheCko, you can create issue to our github repository, of contact CheCko team through discord or telegram.
      </div>
      <div class='row full-width vertical-sections-margin'>
        <q-space />
        <q-img :src='onboardingImproveBanner' width='100%' />
        <q-space />
      </div>
      <div class='text-left full-width vertical-sections-margin'>
        <a href='https://github.com/respeer-ai/linera-wallet/README.md'>Learn how to create an issue while using CheCko.</a>
      </div>
      <div class='vertical-sections-margin'>
        When you start to create an issue to CheCko, we think of you understand you shall obey CheCko community rules.
      </div>
      <div class='row vertical-sections-margin'>
        <q-space />
        <div class='onboarding-btns row'>
          <q-btn
            flat
            label='I understand'
            class='btn vertical-items-margin full-width'
            @click='onAnyBtnClick'
            no-caps
          />
        </div>
        <q-space />
      </div>
    </div>
  </div>
</template>

<script setup lang='ts'>
import { onboardingImproveBanner } from 'src/assets'
import { localStore } from 'src/localstores'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Query {
  target: string
}

const route = useRoute()
const target = ref((route.query as unknown as Query).target)

const router = useRouter()

const onAnyBtnClick = () => {
  void router.push({ path: localStore.setting.formalizePath(target.value) })
}

</script>
