<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import { RpcMethod } from '../../../../src-bex/middleware/types'

const rpcAuths = defineModel<db.RpcAuth[]>('rpcAuths')

const _rpcAuths = useObservable<db.RpcAuth[]>(
  liveQuery(async () => {
    return await dbBase.rpcAuths.toArray()
  }) as never
)

watch(_rpcAuths, () => {
  rpcAuths.value = _rpcAuths.value
})

const createRpcAuth = async (origin: string, publicKey: string, method: RpcMethod) => {
  const microchain = (await dbBase.rpcMicrochains.toArray()).find((el) => el.publicKey === publicKey)?.microchain
  if (!microchain) return
  await dbBase.rpcAuths.add({
    origin,
    publicKey,
    chainId: microchain,
    method
  })
}

const deleteRpcAuth = async (id: number) => {
  await dbBase.rpcAuths.delete(id)
}

defineExpose({
  createRpcAuth,
  deleteRpcAuth
})

</script>
