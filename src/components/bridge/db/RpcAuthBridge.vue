<script setup lang='ts'>
import { watch } from 'vue'
import { dbModel } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

const rpcAuths = defineModel<dbModel.RpcAuth[]>('rpcAuths')

const _rpcAuths = useObservable<dbModel.RpcAuth[]>(
  liveQuery(async () => {
    return await dbBase.rpcAuths.toArray()
  }) as never
)

watch(_rpcAuths, () => {
  rpcAuths.value = _rpcAuths.value
})

</script>
