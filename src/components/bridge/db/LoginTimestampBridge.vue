<script setup lang='ts'>
import { watch } from 'vue'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

const timestamp = defineModel<number>()

const _timestamp = useObservable<number>(
  from(
    liveQuery(async () => {
      return (await dbBase.lastLogin.toArray()).find(() => true)?.timestamp || 0
    })
  )
)

watch(_timestamp, () => {
  timestamp.value = _timestamp.value
})

const saveLoginTimestamp = async () => {
  return new Promise((resolve, reject) => {
    dbBase.lastLogin.count().then(async (cnt) => {
      if (cnt === 0) {
        await dbBase.lastLogin.add({ timestamp: Date.now() })
      } else {
        const ts = (await dbBase.lastLogin.toArray()).find(() => true)
        await dbBase.lastLogin.update(ts?.id, { timestamp: Date.now() })
      }
      resolve(undefined)
    }).catch((error) => {
      reject(error)
    })
  })
}

const loginTimeout = async (): Promise<boolean> => {
  const timestamp = (await dbBase.lastLogin.toArray()).find(() => true)?.timestamp
  return timestamp === undefined || timestamp < Date.now() - 4 * 60 * 60 * 1000
}

defineExpose({
  saveLoginTimestamp,
  loginTimeout
})

</script>
