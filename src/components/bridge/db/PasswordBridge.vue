<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

const password = defineModel<string>('password')

const _password = useObservable<string | undefined>(
  liveQuery(async () => {
    const passwd = (await dbBase.passwords.toArray()).find((el) => el.active)
    if (!passwd) return undefined
    const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
    if (!fingerPrint) return undefined
    return db.decryptPassword(passwd, fingerPrint.fingerPrint)
  }) as never
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
  const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
  if (!fingerPrint) return Promise.reject('Invalid finterprint')
  const _passwd = db.buildPassword(passwd || password.value || '', fingerPrint.fingerPrint)
  if (_passwd) {
    await dbBase.passwords.add(_passwd)
  }
}

const verifyPassword = async (passwd: string) => {
  const pwd = (await dbBase.passwords.toArray()).find((el) => el.active)
  if (!pwd) return false
  const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
  if (!fingerPrint) return Promise.reject('Invalid finterprint')
  return db.decryptPassword(pwd, fingerPrint.fingerPrint) === passwd
}

const getPassword = async () => {
  const passwd = (await dbBase.passwords.toArray()).find((el) => el.active)
  if (!passwd) return
  const fingerPrint = (await dbBase.deviceFingerPrint.toArray())[0]
  if (!fingerPrint) return Promise.reject('Invalid finterprint')
  return db.decryptPassword(passwd, fingerPrint.fingerPrint)
}

defineExpose({
  savePassword,
  verifyPassword,
  getPassword
})

</script>
