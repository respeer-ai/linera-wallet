<template>
  <q-item class='row full-width tab-panel-item' :style='{ paddingLeft: xPadding, paddingRight: xPadding }'>
    <div v-if='showIndicator' :class='[ "selector-indicator", (active || (activeNative && token.native)) ? "selector-indicator-selected" : "" ]' />
    <q-avatar :class='[ showIndicator ? "selector-margin-x-left" : "" ]'>
      <q-img :src='tokenLogo' width='36px' height='36px' fit='contain' />
      <q-badge
        v-if='!token.native' color='transparent' rounded transparent
        floating
      >
        <q-img :src='lineraLogo' width='14px' height='14px' />
      </q-badge>
    </q-avatar>
    <div class='selector-margin-x-left'>
      <div class='text-bold text-grey-9 text-left'>
        {{ token.ticker }}
      </div>
      <div class='text-grey-6 text-left'>
        {{ token.name }}
      </div>
    </div>
    <q-space />
    <div class='selector-margin-x-left'>
      <q-btn
        flat rounded dense :label='$t("MSG_REQUEST_NOW")'
        @click='onRequestNowClick'
        :style='{fontSize: "12px"}'
        class='text-blue-6' :loading='requesting'
      />
    </div>
    <div v-if='showIndicator' class='selector-indicator selector-margin-x-left' />
  </q-item>
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { onMounted, ref, toRef } from 'vue'
import { dbBridge, rpcBridge } from 'src/bridge'

import { lineraLogo } from 'src/assets'

interface Props {
  token: db.Token
  showIndicator?: boolean
  active?: boolean
  activeNative?: boolean
  microchain: db.Microchain
  xPadding?: string
}
const props = withDefaults(defineProps<Props>(), {
  showIndicator: true,
  active: false,
  activeNative: true,
  xPadding: '0'
})
const token = toRef(props, 'token')
const showIndicator = toRef(props, 'showIndicator')
const active = toRef(props, 'active')
const activeNative = toRef(props, 'activeNative')
const microchain = toRef(props, 'microchain')
const requesting = ref(false)
const xPadding = toRef(props, 'xPadding')
const tokenLogo = ref('')

const emit = defineEmits<{(ev: 'requested'): void}>()

const onRequestNowClick = async () => {
  requesting.value = true
  try {
    await rpcBridge.ERC20ApplicationOperation.persistApplication(microchain.value.microchain, token.value.applicationId as string, db.ApplicationType.ERC20)
    emit('requested')
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Failed request application: ${e}`)
  }
  requesting.value = false
}

onMounted(async () => {
  tokenLogo.value = await dbBridge.Token.logo(token.value.id as number) as string
})

</script>
