<template>
  <div :class='[ "fill-parent text-center onboarding-container shadow-1", localStore.setting.extensionMode ? "" : "onboarding-padding" ]'>
    <q-carousel
      v-model='slide'
      transition-prev='scale'
      transition-next='scale'
      swipeable
      animated
      control-color='brown-10'
      navigation
      padding
      arrows
      :class='[ "text-black rounded-borders", localStore.setting.extensionMode ? "carousel-dense-slides" : "" ]'
    >
      <q-carousel-slide name='first' class='column no-wrap flex-center'>
        <h5 class='onboarding-page-title'>
          {{ $t('MSG_LETS_GET_STARTED') }}
        </h5>
        <p v-if='localStore.setting.extensionMode'>
          {{ $t('MSG_CHECKO_SECURE_WALLET_MAKING_REAL_TIME_DAPPS_ON_LINERA_ACCESSIBLE_TO_ALL') }}
        </p>
        <p v-else v-html='$t("MSG_CHECKO_SECURE_WALLET_MAKING_REAL_TIME_DAPPS_ON_LINERA_ACCESSIBLE_TO_ALL_LINE_FEED")' />
        <div :style='{margin: "80px 0"}'>
          <q-img :src='cheCkoLogo' width='240px' />
        </div>
      </q-carousel-slide>
      <q-carousel-slide name='second' class='column no-wrap flex-center'>
        <h5 class='onboarding-page-title' v-html='$t("MSG_EXPLORER_REAL_TIME_AND_REACTIVE_DAPPS")' />
        <p v-html='$t("MSG_INTERACT_WITH_WEB3_DAPPS_LIKE_WEB2")' />
        <div :style='{margin: "16px 0"}'>
          <q-img :src='onboardingExplorerBanner' width='320px' />
        </div>
      </q-carousel-slide>
      <q-carousel-slide name='third' class='column no-wrap flex-center'>
        <h5 class='onboarding-page-title'>
          {{ $t('MSG_LOGIN_WITH_YOUR_WALLET') }}
        </h5>
        <p>
          {{ $t('MSG_USE_YOUR_WALLET_TO_LOGIN_TO_DAPPS_LIKE_METAMASK') }}
        </p>
        <div :style='{margin: "16px 0"}'>
          <q-img :src='onboardingLoginBanner' width='320px' />
        </div>
      </q-carousel-slide>
    </q-carousel>
    <p v-html='$t("MSG_BY_CONTINUE_YOU_AGREE_TO_CHECKO_TERM_OF_USE")' />
    <div class='row full-width page-x-padding'>
      <q-space />
      <div class='onboarding-btns'>
        <q-btn
          flat
          :label='$t("MSG_CREATE_A_NEW_WALLET")'
          class='btn vertical-items-margin full-width'
          @click='onCreateWalletClick'
          no-caps
        />
        <q-btn
          flat
          :label='$t("MSG_IMPORTING_AN_EXISTING_WALLET")'
          class='btn btn-alt vertical-items-margin full-width'
          @click='onImportWalletClick'
          no-caps
        />
      </div>
      <q-space />
    </div>
  </div>
</template>

<script setup lang='ts'>
import { cheCkoLogo, onboardingExplorerBanner, onboardingLoginBanner } from 'src/assets'
import { localStore } from 'src/localstores'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const slide = ref('first')

const onCreateWalletClick = () => {
  void router.push({
    path: localStore.setting.formalizePath('/improvement'),
    query: {
      target: '/initializewallet'
    }
  })
}

const onImportWalletClick = () => {
  void router.push({
    path: localStore.setting.formalizePath('/improvement'),
    query: {
      target: '/importwallet'
    }
  })
}
</script>
