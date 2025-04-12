<script setup lang='ts'>
import { watch } from 'vue'
import { dbModel } from '../../../model'
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
    return dbModel.decryptPassword(passwd, fingerPrint.fingerPrint)
  }) as never
)

watch(_password, () => {
  password.value = _password.value
})

</script>
