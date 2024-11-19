<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

const rpcMicrochains = defineModel<db.OriginRpcMicrochain[]>('rpcMicrochains')

const _rpcMicrochains = useObservable<db.OriginRpcMicrochain[]>(
  liveQuery(async () => {
    return await dbBase.rpcMicrochains.toArray()
  }) as never
)

watch(_rpcMicrochains, () => {
  rpcMicrochains.value = _rpcMicrochains.value
})

const formalizeOriginRpcMicrochain = async (origin: string) => {
  const microchains = await dbBase.rpcMicrochains.where('origin').equals(origin).toArray()
  if (microchains.length > 1) {
    for (const microchain of microchains) {
      await dbBase.rpcMicrochains.delete(microchain.id)
    }
  }
}

const createOriginRpcMicrochain = async (origin: string, publicKey: string, microchain: string) => {
  await formalizeOriginRpcMicrochain(origin)
  const _microchain = await dbBase.rpcMicrochains.where('origin').equals(origin).first() || {
    origin,
    publicKey,
    microchain
  } as db.OriginRpcMicrochain
  _microchain.microchain = microchain
  _microchain.id === undefined
    ? await dbBase.rpcMicrochains.add(_microchain)
    : await dbBase.rpcMicrochains.update(_microchain.id, _microchain)
}

const deleteOriginRpcMicrochain = async (id: number) => {
  await dbBase.rpcMicrochains.delete(id)
}

const getOriginRpcMicrochain = async (origin: string) => {
  return await dbBase.rpcMicrochains.where('origin').equals(origin).first()
}

defineExpose({
  createOriginRpcMicrochain,
  deleteOriginRpcMicrochain,
  getOriginRpcMicrochain
})

</script>
