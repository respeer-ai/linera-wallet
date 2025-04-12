<script setup lang='ts'>
import { watch } from 'vue'
import { dbModel } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

const rpcMicrochains = defineModel<dbModel.OriginRpcMicrochain[]>('rpcMicrochains')

const _rpcMicrochains = useObservable<dbModel.OriginRpcMicrochain[]>(
  liveQuery(async () => {
    return await dbBase.rpcMicrochains.toArray()
  }) as never
)

watch(_rpcMicrochains, () => {
  rpcMicrochains.value = _rpcMicrochains.value
})

</script>
