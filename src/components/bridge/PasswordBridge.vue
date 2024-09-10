<script setup lang='ts'>
import { onMounted, watch } from 'vue'
import { buildPassword, decryptPassword } from '../../model'
import { dbBase } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

const password = defineModel<string>('password')

const _password = useObservable<string | undefined>(
  from(
    liveQuery(async () => {
      const passwd = (await dbBase.passwords.toArray()).find((el) => el.active)
      if (!passwd) return undefined
      return decryptPassword(passwd)
    })
  )
)

watch(_password, () => {
  password.value = _password.value
})

watch(password, () => {
  if (!password.value?.length) return
  if (password.value === _password.value) return
  const passwd = buildPassword(password.value)
  if (passwd) {
    void dbBase.passwords.add(passwd)
  }
})

onMounted(() => {
  if (!password.value?.length) return
  console.log(111, password.value)
  const passwd = buildPassword(password.value)
  if (passwd) {
    void dbBase.passwords.add(passwd)
  }
})

</script>
