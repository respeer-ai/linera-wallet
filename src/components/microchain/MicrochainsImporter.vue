<template>
  <DbNetworkBridge v-model:selected-network='selectedNetwork' />
  <DbMicrochainBridge ref='dbMicrochainBridge' />
  <DbMicrochainOwnerBridge ref='dbMicrochainOwnerBridge' />
  <DbPasswordBridge ref='dbPasswordBridge' />
  <RpcMicrochainBridge ref='rpcMicrochainBridge' />
</template>

<script setup lang='ts'>
import { ref, computed, watch } from 'vue'
import { db } from 'src/model'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { _hex } from 'src/utils'

import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import DbMicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import DbNetworkBridge from '../bridge/db/NetworkBridge.vue'
import DbPasswordBridge from '../bridge/db/PasswordBridge.vue'
import RpcMicrochainBridge from '../bridge/rpc/MicrochainBridge.vue'

const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()
const dbMicrochainOwnerBridge = ref<InstanceType<typeof DbMicrochainOwnerBridge>>()
const dbPasswordBridge = ref<InstanceType<typeof DbPasswordBridge>>()
const rpcMicrochainBridge = ref<InstanceType<typeof RpcMicrochainBridge>>()

const selectedNetwork = ref(undefined as unknown as db.Network)
const networkId = computed(() => selectedNetwork.value?.id)

watch(networkId, async () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const password = await dbPasswordBridge.value?.getPassword()
  if (!password) return Promise.reject(new Error('Invalid password'))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const microchains = await dbMicrochainBridge.value?.getMicrochains(0, 1000) as db.Microchain[] || [] as db.Microchain[]
  for (const microchain of microchains) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const owners = await dbMicrochainOwnerBridge.value?.getMicrochainOwners(microchain.microchain) || []
    for (const owner of owners) {
      const privateKey = db.privateKey(owner as db.Owner, password as string)
      const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey)))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      rpcMicrochainBridge.value?.initMicrochainStore(keyPair, microchain.microchain, microchain.messageId, microchain.certificateHash)
        .then(async () => {
          microchain.imported = true
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await dbMicrochainBridge.value?.updateMicrochain(microchain)
        })
        .catch(async () => {
          microchain.imported = false
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          await dbMicrochainBridge.value?.updateMicrochain(microchain)
        })
    }
  }
})

</script>
