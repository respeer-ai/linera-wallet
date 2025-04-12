<template>
  <div>
    <DbMicrochainBridge v-model:microchains='microchains' />
    <DbTokenBridge v-model:tokens='tokens' />
    <ConstructBlock ref='constructBlock' />
  </div>
</template>

<script setup lang='ts'>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { dbModel } from 'src/model'
import { localStore } from 'src/localstores'
import { blockWorker } from 'src/worker'
import { dbBridge, rpcBridge } from 'src/bridge'

import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import DbTokenBridge from '../bridge/db/TokenBridge.vue'
import ConstructBlock from './ConstructBlock.vue'

const constructBlock = ref<InstanceType<typeof ConstructBlock>>()

const microchains = ref([] as dbModel.Microchain[])
const tokens = ref([] as dbModel.Token[])
const microchainsImportState = computed(() => localStore.setting.MicrochainsImportState)
const tokensImportState = computed(() => localStore.setting.TokensImportState)

type stopFunc = () => void
const subscribed = ref(new Map<string, stopFunc>())

const subscribeMicrochain = async (microchain: dbModel.Microchain) => {
  const memeChain = tokens.value.findIndex((el) => el.creatorChainId === microchain.microchain) >= 0

  const unsubscribe = await rpcBridge.Block.subscribe(
    microchain.microchain, memeChain, (hash: string) => {
      blockWorker.BlockWorker.send(blockWorker.BlockEventType.NEW_BLOCK, {
        microchain: microchain.microchain,
        hash,
        memeChain
      })
    }, () => {
      if (window.location.origin.startsWith('http')) {
        blockWorker.BlockWorker.send(blockWorker.BlockEventType.NEW_INCOMING_BUNDLE, {
          microchain: microchain.microchain
        })
      }
    }) as () => void

  try {
    if (window.location.origin.startsWith('http')) {
      blockWorker.BlockWorker.send(blockWorker.BlockEventType.NEW_INCOMING_BUNDLE, {
        microchain: microchain.microchain
      })
    }
  } catch {
    // DO NOTHING
  }

  return unsubscribe
}

const subscribeMicrochains = async () => {
  for (const microchain of microchains.value) {
    if (subscribed.value.get(microchain.microchain)) continue
    try {
      const stop = await subscribeMicrochain({ ...microchain })
      subscribed.value.set(microchain.microchain, stop)
    } catch (e) {
      console.log('Failed subscribe microchain', microchain.microchain, e)
    }
  }
  for (const token of tokens.value) {
    if (!token.creatorChainId) continue
    if (subscribed.value.get(token.creatorChainId)) continue
    const microchain = await dbBridge.Microchain.microchain(token.creatorChainId)
    if (!microchain) continue
    try {
      const stop = await subscribeMicrochain({ ...microchain })
      subscribed.value.set(microchain.microchain, stop)
    } catch (e) {
      console.log('Failed subscribe microchain', microchain.microchain, e)
    }
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
