<script setup lang='ts'>
import { onMounted, toRef, watch } from 'vue'
import { buildPassword, type Password } from '../../model'
import { dbBase } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

interface Props {
  create?: string
}

const props = defineProps<Props>()
const create = toRef(props, 'create')

const password = defineModel<Password>('password')

const _password = useObservable<Password | undefined>(
  from(
    liveQuery(async () => {
      return (await dbBase.passwords.toArray()).find((el) => el.active)
    })
  )
)

watch(_password, () => {
  password.value = _password.value
})

watch(create, () => {
  if (!create.value?.length) return
  const password = buildPassword(create.value)
  void dbBase.passwords.add(password)
})

onMounted(() => {
  if (!create.value) return
  const password = buildPassword(create.value)
  void dbBase.passwords.add(password)
})

</script>
