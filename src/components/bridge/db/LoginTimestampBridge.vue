<script setup lang='ts'>
import { watch } from 'vue'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

const timestamp = defineModel<number>()

const _timestamp = useObservable<number>(
  liveQuery(async () => {
    return (await dbBase.lastLogin.toArray()).find(() => true)?.timestamp || 0
  }) as never
)

watch(_timestamp, () => {
  timestamp.value = _timestamp.value
})

</script>
