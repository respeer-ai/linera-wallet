<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

const password = defineModel<string>('password')

const _password = useObservable<string | undefined>(
  from(
    liveQuery(async () => {
      const passwd = (await dbBase.passwords.toArray()).find((el) => el.active)
      if (!passwd) return undefined
      return db.decryptPassword(passwd)
    })
  )
)

watch(_password, () => {
  password.value = _password.value
})

const resetActive = async () => {
  for (const passwd of (await dbBase.passwords.toArray()).filter((el) => el.active)) {
    await dbBase.passwords.update(passwd.id, { active: false })
  }
}

const savePassword = async (passwd?: string) => {
  if (!passwd?.length && !password.value?.length) {
    throw Error('Invalid password')
  }
  await resetActive()
  const _passwd = db.buildPassword(passwd || password.value || '')
  if (_passwd) {
    await dbBase.passwords.add(_passwd)
  }
}

defineExpose({
  savePassword
})

</script>
