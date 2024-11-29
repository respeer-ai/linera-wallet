<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import { localStore } from 'src/localstores'

const networks = defineModel<db.Network[]>('networks')
const selectedNetwork = defineModel<db.Network>('selectedNetwork')

const _networks = useObservable<db.Network[]>(
  liveQuery(async () => {
    return await dbBase.networks.toArray()
  }) as never
)

watch(_networks, async () => {
  selectedNetwork.value = _networks.value?.find((el) => el.selected)
  networks.value = _networks.value
  if (localStore.setting.creatingDefaultNetwork) {
    return
  }
  localStore.setting.CreatingDefaultNetwork = true
  if (!_networks.value?.length && !await dbBase.networks.count()) {
    await dbBase.networks.add(db.defaultNetwork)
  }
})

</script>
