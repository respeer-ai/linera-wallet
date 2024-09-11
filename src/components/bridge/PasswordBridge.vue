<script setup lang='ts'>
import { watch } from 'vue'
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

const savePassword = async (passwd?: string) => {
  if (!passwd?.length && !password.value?.length) {
    throw Error('Invalid password')
  }
  const _passwd = buildPassword(passwd || password.value || '')
  if (_passwd) {
    await dbBase.passwords.add(_passwd)
  }
}

defineExpose({
  savePassword
})

</script>
