<script setup lang='ts'>
import { rpc } from 'src/model'
import * as lineraWasm from '../../../src-bex/wasm/linera_wasm'

const calculateBlockStateHashWithFullMaterials = async (
  microchain: string,
  operation: rpc.Operation | undefined,
  incomingBundles: rpc.IncomingBundle[],
  localTime: number
): Promise<string> => {
  return new Promise((resolve, reject) => {
    lineraWasm.execute_operations_with_full_materials(
      microchain,
      JSON.stringify(operation ? [operation] : []),
      JSON.stringify(incomingBundles),
      localTime as unknown as bigint
    ).then((v) => {
      console.log(v)
      resolve(v as string)
    }).catch((error) => {
      console.log(error)
      reject(error)
    })
  })
}

defineExpose({
  calculateBlockStateHashWithFullMaterials
})

</script>
