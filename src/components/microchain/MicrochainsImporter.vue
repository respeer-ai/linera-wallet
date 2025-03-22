<template>
  <DbNetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { ref, computed, watch } from 'vue'
import { db } from 'src/model'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { _hex } from 'src/utils'
import { localStore } from 'src/localstores'

import DbNetworkBridge from '../bridge/db/NetworkBridge.vue'
import { dbBridge, rpcBridge } from 'src/bridge'

const selectedNetwork = ref(undefined as unknown as db.Network)
const networkId = computed(() => selectedNetwork.value?.id)

watch(networkId, async (newValue) => {
  if (newValue === networkId.value) return

  localStore.setting.MicrochainsImportState = localStore.settingDef.MicrochainsImportState.MicrochainsImporting

  const password = await dbBridge.Password.password()
  if (!password) return Promise.reject(new Error('Invalid password'))
  const microchains = await dbBridge.Microchain.microchains(0, 1000, false)
  for (const microchain of microchains) {
    const owners = await dbBridge.MicrochainOwner.microchainOwners(microchain.microchain)
    for (const owner of owners) {
      const privateKey = db.privateKey(owner, password)
      const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey)))
      try {
        await rpcBridge.Microchain.initMicrochainStore(keyPair, microchain.microchain, microchain.messageId)
        microchain.imported = true
      } catch {
        microchain.imported = false
      }
      await dbBridge.Microchain.update(microchain)
    }
  }

  localStore.setting.MicrochainsImportState = localStore.settingDef.MicrochainsImportState.MicrochainsImported
})

</script>
