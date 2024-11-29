<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

const namedApplications = defineModel<db.NamedApplication[]>('namedApplications')

const _namedApplications = useObservable<db.NamedApplication[]>(
  liveQuery(async () => {
    return await dbWallet.namedApplications.toArray()
  }) as never
)

watch(_namedApplications, () => {
  namedApplications.value = _namedApplications.value
})

</script>
