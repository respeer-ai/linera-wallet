<template>
  <div>
    <div :class='[ "onboarding-container", localStore.setting.extensionMode ? "page-x-padding" : "onboarding-padding" ]'>
      <h5 class='onboarding-page-title text-center'>
        {{ $t('MSG_HELP_US_IMPROVE_CHECKO') }}
      </h5>
      <div :style='{ maxHeight: localStore.setting.extensionMode ? "456px" : "100%", overflow: "scroll" }'>
        <div class='text-left' v-html='$t("MSG_HELP_IMPROVING_CHECKO_BY_CREATE_GITHUB_ISSUE")' />
        <div class='row full-width vertical-sections-margin'>
          <q-space />
          <q-img :src='onboardingImproveBanner' width='100%' />
          <q-space />
        </div>
        <div class='text-left full-width vertical-sections-margin'>
          <a href='https://github.com/respeer-ai/linera-wallet/README.md'>{{ $t('MSG_LEARN_HOW_TO_CREATE_ISSUE_WHEN_USING_CHECKO') }}</a>
        </div>
        <div class='vertical-sections-margin'>
          {{ $t('MSG_UNDERSTAND_OBEY_CHECKO_COMMUNITY_RULES_CREATING_ISSUE') }}
        </div>
      </div>
      <div class='row vertical-menus-margin'>
        <q-space />
        <div class='onboarding-btns row'>
          <q-btn
            flat
            :label='$t("MSG_I_UNDERSTAND")'
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
