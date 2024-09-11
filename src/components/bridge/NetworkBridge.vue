<script setup lang='ts'>
import { watch } from 'vue'
import { defaultNetwork, type Network } from '../../model'
import { dbBase } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

const networks = defineModel<Network[]>('networks')
const selectedNetwork = defineModel<Network>('selectedNetwork')

const _networks = useObservable<Network[]>(
  from(
    liveQuery(async () => {
      return await dbBase.networks.toArray()
    })
  )
)

watch(_networks, async () => {
  networks.value = _networks.value
  selectedNetwork.value = _networks.value?.find((el) => el.selected)
  if (networks.value === _networks.value) return
  if (_networks.value !== undefined && !_networks.value.length) {
    await dbBase.networks.add(defaultNetwork)
  }
})

const resetSelected = async () => {
  const _networks = networks.value?.filter((network) => network.selected) || []
  for (const network of _networks) {
    await dbBase.networks.update(network.id, { selected: false })
  }
}

const updateNetwork = async (network: Network) => {
  if (network.selected) await resetSelected()
  await dbBase.networks.update(network.id, network)
}

const deleteNetwork = async (id: number) => {
  await dbBase.networks.delete(id)
}

defineExpose({
  deleteNetwork,
  updateNetwork
})

</script>
