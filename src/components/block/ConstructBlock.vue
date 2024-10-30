<template>
  <DbMicrochainBridge ref='dbMicrochainBridge' />
</template>

<script setup lang='ts'>
import { rpc } from 'src/model'
import { ref } from 'vue'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { type IncomingBundle } from 'src/__generated__/graphql/service/graphql'

import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'

const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()

const constructBlock = async (
  microchain: string,
  operation: rpc.Operation | undefined,
  incomingBundles: IncomingBundle[],
  localTime: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    dbMicrochainBridge.value?.microchainOwner(microchain).then((owner) => {
      if (!owner) reject('Invalid owner')

      lineraWasm.construct_block(
        microchain,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        owner?.address as string,
        microchain,
        microchain,
        JSON.stringify(operation ? [operation] : []),
        JSON.stringify(incomingBundles),
        BigInt(localTime),
        BigInt(1)
      ).then((v) => {
        resolve(v as string)
      }).catch((error) => {
        reject(error)
      })
    }).catch((error) => {
      reject(error)
    })
  })
}

defineExpose({
  constructBlock
})

</script>
