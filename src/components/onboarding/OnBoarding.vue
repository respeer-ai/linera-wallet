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
          Let's get started
        </h5>
        <p v-if='localStore.setting.extensionMode'>
          CheCko is a secure wallet making the world of real time & reactive dApps on Linera accessible to all.
        </p>
        <p v-else>
          CheCko is a secure wallet making the world of<br>real time & reactive dApps on Linera accessible to all.<br>
        </p>
        <div :style='{margin: "80px 0"}'>
          <q-img :src='cheCkoLogo' width='240px' />
        </div>
      </q-carousel-slide>
      <q-carousel-slide name='second' class='column no-wrap flex-center'>
        <h5 class='onboarding-page-title'>
          Explorer real time &<br>reactive dApps
        </h5>
        <p>
          Interact with web3 dApps like web2 with expectable<br>responsiveness and highly availability.
        </p>
        <div :style='{margin: "16px 0"}'>
          <q-img :src='onboardingExplorerBanner' width='320px' />
        </div>
      </q-carousel-slide>
      <q-carousel-slide name='third' class='column no-wrap flex-center'>
        <h5 class='onboarding-page-title'>
          Login with your wallet
        </h5>
        <p>
          Use your CheCko to login to real time & reactive dApps, just like what you do with Metamask.
        </p>
        <div :style='{margin: "16px 0"}'>
          <q-img :src='onboardingLoginBanner' width='320px' />
        </div>
      </q-carousel-slide>
    </q-carousel>
    <p>
      By continue you agree to CheCko's <a href='#'>Terms of use</a>
    </p>
    <div class='row full-width page-x-padding'>
      <q-space />
      <div class='onboarding-btns'>
        <q-btn
          flat
          label='Create a new wallet'
          class='btn vertical-items-margin full-width'
          @click='onCreateWalletClick'
          no-caps
        />
        <q-btn
          flat
          label='Importing an existing wallet'
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
