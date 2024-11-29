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

</script>
