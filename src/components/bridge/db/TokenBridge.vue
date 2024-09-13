<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

const tokens = defineModel<db.Token[]>('tokens')

const _tokens = useObservable<db.Token[]>(
  from(
    liveQuery(async () => {
      return await dbBase.tokens.toArray()
    })
  )
)

watch(_tokens, async () => {
  if (tokens.value === _tokens.value) return
  tokens.value = _tokens.value
  if (_tokens.value !== undefined && !_tokens.value.length) {
    await dbBase.tokens.add(db.lineraToken)
  }
})

const updateToken = async (token: db.Token) => {
  await dbBase.tokens.update(token.id, token)
}

const deleteToken = async (id: number) => {
  await dbBase.tokens.delete(id)
}

defineExpose({
  deleteToken,
  updateToken
})

</script>
