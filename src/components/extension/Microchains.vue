<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div :style='{ width: "100%" }'>
    <div v-if='showTitle' class='text-brown-6 text-bold' :style='{margin: "0 0 16px 0"}'>
      Microchains
    </div>
    <div
      v-for='chainId in microchains.keys()'
      :key='chainId'
      class='cursor-pointer hover list-expand'
      :style='{
        paddingTop: "8px",
        paddingBottom: "8px",
        fontSize: "16px"
      }'
    >
      <div class='row text-grey-7'>
        <q-avatar
          class='bg-red-1' icon='diamond' text-color='brown-6' size='md'
          :style='{marginRight: "8px"}'
        />
        <div>
          <div :style='{fontSize: "12px"}'>
            Chain ID
          </div>
          <div
            :style='{
              width: "100%",
              color: "#555555",
              fontSize: "16px"
            }'
            class='row'
          >
            <span>{{ shortid.shortId(chainId, 8) }}</span>
            <q-icon
              name='content_copy'
              size='16px'
              color='grey'
              :style='{
                margin: "2px 0 2px 8px",
              }'
              class='cursor-pointer'
              @click='onCopyChainIdClick(chainId)'
            />
          </div>
          <div
            :style='{
              color: "#555555",
              fontSize: "12px"
            }'
          >
            {{ localStore.wallet.chainBalance(undefined, chainId).toFixed(4) }}
            <strong>TLINERA</strong>
          </div>
        </div>
        <q-space />
        <div
          :style='{
            color: "#555555",
            fontSize: "22px"
          }'
          class='text-bold'
        >
          {{ localStore.wallet.accountBalance(undefined, chainId).toFixed(4) }}
        </div>
        <div
          v-if='showAction'
          :style='{
            width: "200px",
            color: "#555555",
            marginLeft: "36px"
          }'
          class='row'
        >
          <q-btn
            dense
            rounded
            flat
            @click='onTransferClick(chainId)'
            class='text-blue-6'
          >
            <span :style='{fontSize: "12px"}'>Transfer</span>
          </q-btn>
          <q-btn
            dense
            rounded
            flat
            @click='onCloseClick(chainId)'
            class='text-grey-6'
          >
            <span :style='{fontSize: "12px"}'>Close</span>
          </q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { localStore } from 'src/localstores'
import { copyToClipboard } from 'quasar'
import { shortid } from 'src/utils'
import { useRouter } from 'vue-router'

interface Props {
  showTitle?: boolean
  showAction?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showTitle: true,
  showAction: false
})
const showTitle = toRef(props, 'showTitle')
const showAction = toRef(props, 'showAction')

const microchains = computed(() => localStore.wallet.currentChains)

const onCopyChainIdClick = (chainId: string) => {
  copyToClipboard(chainId)
    .then(() => {
      localStore.notification.pushNotification({
        Title: 'Copy Chain Id',
        Message: `Success copy chain id ${chainId} to clipboard.`,
        Popup: true,
        Type: localStore.notify.NotifyType.Info
      })
    })
    .catch((e) => {
      console.log('Fail copy chain id', e)
    })
}

const router = useRouter()

const onTransferClick = (chainId: string) => {
  void router.push({
    path: localStore.oneShotSetting.formalizePath('/transfer'),
    query: {
      chainId
    }
  })
}

const onCloseClick = (chainId: string) => {
  console.log(chainId)
}

</script>
