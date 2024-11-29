<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import { dbBridge } from 'src/bridge'

const tokens = defineModel<db.Token[]>('tokens')
const count = defineModel<number>('count')

const _tokens = useObservable<db.Token[]>(
  liveQuery(async () => {
    return await dbBase.tokens.toArray()
  }) as never
)

const _count = useObservable<number>(
  liveQuery(async () => {
    return await dbBridge.Token.count()
  }) as never
)

watch(_tokens, () => {
  if (tokens.value === _tokens.value) return
  tokens.value = _tokens.value
})

watch(_count, () => {
  count.value = _count.value
})

</script>
