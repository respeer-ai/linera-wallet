<script setup lang='ts'>
import { onMounted, toRef, watch } from 'vue'
import { defaultNetwork, type Network } from '../../model'
import { dbNetwork } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

interface Props {
  create?: Network
  update?: Network
  delete?: number
}

const props = defineProps<Props>()
const create = toRef(props, 'create')
const update = toRef(props, 'update')
const _delete = toRef(props, 'delete')

const networks = defineModel<Network[]>('networks')
const selectedNetwork = defineModel<Network>('selectedNetwork')

const _networks = useObservable<Network[]>(
  from(
    liveQuery(async () => {
      return await dbNetwork.networks.toArray()
    })
  )
)

watch(_networks, () => {
  networks.value = _networks.value
  selectedNetwork.value = _networks.value?.find((el) => el.selected)
  if (_networks.value !== undefined && !_networks.value.length) {
    void dbNetwork.networks.add(defaultNetwork)
  }
})

watch(create, () => {
  if (!create.value) return
  void dbNetwork.networks.add(JSON.parse(JSON.stringify(create.value)) as Network)
})

watch(update, () => {
  if (!update.value) return
  void dbNetwork.networks.update(update.value.id, JSON.parse(JSON.stringify(update.value)) as Network)
})

watch(_delete, () => {
  if (_delete.value === undefined) return
  void dbNetwork.networks.delete(_delete.value)
})

onMounted(() => {
  if (!create.value) return
  void dbNetwork.networks.add(JSON.parse(JSON.stringify(create.value)) as Network)
})

</script>
