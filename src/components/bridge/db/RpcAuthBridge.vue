<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

const rpcAuths = defineModel<db.RpcAuth[]>('rpcAuths')

const _rpcAuths = useObservable<db.RpcAuth[]>(
  liveQuery(async () => {
    return await dbBase.rpcAuths.toArray()
  }) as never
)

watch(_rpcAuths, () => {
  rpcAuths.value = _rpcAuths.value
})

</script>
