<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

const networks = defineModel<db.Network[]>('networks')
const selectedNetwork = defineModel<db.Network>('selectedNetwork')

const _networks = useObservable<db.Network[]>(
  from(
    liveQuery(async () => {
      return await dbBase.networks.toArray()
    })
  )
)

watch(_networks, async () => {
  if (networks.value === _networks.value) return
  networks.value = _networks.value
  selectedNetwork.value = _networks.value?.find((el) => el.selected)
  if (_networks.value !== undefined && !await dbBase.networks.count()) {
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

defineExpose({
  createNetwork,
  deleteNetwork,
  updateNetwork
})

</script>
