<template>
  <DbNetworkBridge v-model:selected-network='selectedNetwork' />
</template>

<script setup lang='ts'>
import { ref, computed, watch } from 'vue'
import { dbModel } from 'src/model'
import { localStore } from 'src/localstores'

import DbNetworkBridge from '../bridge/db/NetworkBridge.vue'
import { dbBridge, rpcBridge } from 'src/bridge'

const selectedNetwork = ref(undefined as unknown as dbModel.Network)
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
      const privateKeyHex = dbModel.privateKey(owner, password)
      try {
        await rpcBridge.Microchain.initMicrochainStore(owner.owner, privateKeyHex, microchain.microchain, microchain.messageId)
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
