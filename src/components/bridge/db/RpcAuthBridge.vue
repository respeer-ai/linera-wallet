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

const createRpcAuth = async (origin: string, publicKey: string, method: RpcMethod, applicationId?: string, operation?: string, persistAuth?: boolean) => {
  const microchain = (await dbBase.rpcMicrochains.toArray()).find((el) => el.publicKey === publicKey)?.microchain
  if (!microchain) return
  await dbBase.rpcAuths.add({
    origin,
    publicKey,
    chainId: microchain,
    method,
    applicationId,
    operation,
    expiredAt: persistAuth ? Date.now() + 24 * 3600 : 0
  })
}

const deleteRpcAuth = async (id: number) => {
  await dbBase.rpcAuths.delete(id)
}

const getRpcAuthsWithOrigin = async (origin: string) => {
  return await dbBase.rpcMicrochains.where('origin').equals(origin).toArray()
}

defineExpose({
  createRpcAuth,
  deleteRpcAuth,
  getRpcAuthsWithOrigin
})

</script>
