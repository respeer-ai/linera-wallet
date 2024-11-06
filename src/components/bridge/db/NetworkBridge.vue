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

const resetSelected = async () => {
  const _networks = networks.value?.filter((network) => network.selected) || []
  for (const network of _networks) {
    await dbBase.networks.update(network.id, { selected: false })
  }
}

const createNetwork = async (network: db.Network) => {
  if (network.selected) await resetSelected()
  await dbBase.networks.add(network)
}

const updateNetwork = async (network: db.Network) => {
  if (network.selected) await resetSelected()
  await dbBase.networks.update(network.id, network)
}

const deleteNetwork = async (id: number) => {
  await dbBase.networks.delete(id)
}

const _selectedNetwork = async () => {
  return (await dbBase.networks.toArray()).find((el) => el.selected)
}

defineExpose({
  createNetwork,
  deleteNetwork,
  updateNetwork,
  _selectedNetwork
})

</script>
