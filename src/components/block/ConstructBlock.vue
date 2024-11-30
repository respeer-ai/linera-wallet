<template>
  <div />
</template>

<script setup lang='ts'>
import { rpc } from 'src/model'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'
import { type IncomingBundle } from 'src/__generated__/graphql/service/graphql'
import { dbBridge } from 'src/bridge'
import { stringify } from 'lossless-json'

const constructBlock = async (
  microchain: string,
  operation: rpc.Operation | undefined,
  incomingBundles: IncomingBundle[],
  localTime: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    dbBridge.Microchain.microchainOwner(microchain).then((owner) => {
      if (!owner) reject('Invalid owner')

      lineraWasm.construct_block(
        microchain,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
        owner?.address as string,
        microchain,
        microchain,
        stringify(operation ? [operation] : []) as string,
        stringify(incomingBundles) as string,
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
