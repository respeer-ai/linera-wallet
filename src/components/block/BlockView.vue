<template>
  <div>
    <DbMicrochainBridge v-model:microchains='microchains' />
    <DbTokenBridge v-model:tokens='tokens' />
  </div>
</template>

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { dbModel } from 'src/model'
import { localStore } from 'src/localstores'
import { blockWorker } from 'src/worker'
import { rpcBridge } from 'src/bridge'

import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import DbTokenBridge from '../bridge/db/TokenBridge.vue'

const microchains = ref([] as dbModel.Microchain[])
const tokens = ref([] as dbModel.Token[])
const microchainsImportState = computed(() => localStore.setting.MicrochainsImportState)
const tokensImportState = computed(() => localStore.setting.TokensImportState)

type stopFunc = () => void
const subscribed = ref(new Map<string, stopFunc>())

const subscribeMicrochain = async (microchain: string) => {
  const memeChain = tokens.value.findIndex((el) => el.creatorChainId === microchain) >= 0

  if (window.location.origin.startsWith('http')) {
    blockWorker.BlockWorker.send(blockWorker.BlockEventType.NEW_INCOMING_BUNDLE, {
      microchain
    })
  }

  const unsubscribe = await rpcBridge.Block.subscribe(
    microchain, memeChain, (hash: string) => {
      blockWorker.BlockWorker.send(blockWorker.BlockEventType.NEW_BLOCK, {
        microchain,
        hash,
        memeChain
      })
    }, () => {
      if (window.location.origin.startsWith('http')) {
        blockWorker.BlockWorker.send(blockWorker.BlockEventType.NEW_INCOMING_BUNDLE, {
          microchain
        })
      }
    }) as () => void

  return unsubscribe
}

const subscribeMicrochains = async () => {
  for (const microchain of microchains.value) {
    if (subscribed.value.get(microchain.microchain)) continue
    const stop = await subscribeMicrochain(microchain.microchain)
    subscribed.value.set(microchain.microchain, stop)
  }
  for (const token of tokens.value) {
    if (!token.creatorChainId) continue
    if (subscribed.value.get(token.creatorChainId)) continue
    const stop = await subscribeMicrochain(token.creatorChainId)
    subscribed.value.set(token.creatorChainId, stop)
  }
}

const unsubscribeMicrochains = () => {
  subscribed.value.forEach((stop) => {
    stop()
  })
}

watch(microchains, async () => {
  await subscribeMicrochains()
})

watch(tokens, async () => {
  for (const token of tokens.value) {
    if (!token.creatorChainId) continue
    blockWorker.BlockWorker.send(blockWorker.BlockEventType.NEW_BLOCK, {
      microchain: token.creatorChainId,
      memeChain: true
    })
  }
  await subscribeMicrochains()
})

watch(microchainsImportState, async () => {
  switch (microchainsImportState.value) {
    case localStore.settingDef.MicrochainsImportState.MicrochainsImported:
      unsubscribeMicrochains()
      await subscribeMicrochains()
  }
})

watch(tokensImportState, () => {
  switch (tokensImportState.value) {
    case localStore.settingDef.TokensImportState.TokensImported:
      for (const microchain of microchains.value) {
        blockWorker.BlockWorker.send(blockWorker.BlockEventType.NEW_BLOCK, {
          microchain: microchain.microchain
        })
      }
  }
})

onMounted(async () => {
  await subscribeMicrochains()
})

onUnmounted(() => {
  unsubscribeMicrochains()
})

</script>
