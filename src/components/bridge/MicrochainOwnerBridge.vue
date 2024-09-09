<script setup lang='ts'>
import { onMounted, toRef, watch } from 'vue'
import { type MicrochainOwner } from '../../model'
import { db } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

interface Props {
  create?: MicrochainOwner
  update?: MicrochainOwner
  delete?: number
}

const props = defineProps<Props>()
const create = toRef(props, 'create')
const update = toRef(props, 'update')
const _delete = toRef(props, 'delete')

const microchainOwners = defineModel<MicrochainOwner[]>('microchainOwners')

const _microchainOwners = useObservable<MicrochainOwner[]>(
  from(
    liveQuery(async () => {
      return await db.microchainOwners.toArray()
    })
  )
)

watch(_microchainOwners, () => {
  microchainOwners.value = _microchainOwners.value
})

watch(create, () => {
  if (!create.value) return
  void db.microchainOwners.add(JSON.parse(JSON.stringify(create.value)) as MicrochainOwner)
})

watch(update, () => {
  if (!update.value) return
  void db.microchainOwners.update(update.value.id, JSON.parse(JSON.stringify(update.value)) as MicrochainOwner)
})

watch(_delete, () => {
  if (_delete.value === undefined) return
  void db.microchainOwners.delete(_delete.value)
})

onMounted(() => {
  if (!create.value) return
  console.log(create.value)
  void db.microchainOwners.add(JSON.parse(JSON.stringify(create.value)) as MicrochainOwner)
})

</script>
