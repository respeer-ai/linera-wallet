<script setup lang='ts'>
import { watch } from 'vue'
import { db } from '../../../model'
import { dbBase } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'
import { localStore } from 'src/localstores'

const tokens = defineModel<db.Token[]>('tokens')

const _tokens = useObservable<db.Token[]>(
  liveQuery(async () => {
    return await dbBase.tokens.toArray()
  }) as never
)

watch(_tokens, async () => {
  if (tokens.value === _tokens.value) return
  tokens.value = _tokens.value
  if (localStore.setting.creatingDefaultToken) {
    return
  }
  localStore.setting.CreatingDefaultToken = true
  if (_tokens.value !== undefined && !await dbBase.tokens.count()) {
    await dbBase.tokens.add(db.lineraToken)
    localStore.setting.CreatingDefaultToken = false
  }
})

const createToken = async (token: db.Token) => {
  if ((await dbBase.tokens.toArray()).findIndex((el) => el.applicationId === token.applicationId) >= 0) return
  await dbBase.tokens.add(token)
}

const updateToken = async (token: db.Token) => {
  await dbBase.tokens.update(token.id, token)
}

const deleteToken = async (id: number) => {
  await dbBase.tokens.delete(id)
}

const nativeToken = async () => {
  return (await dbBase.tokens.toArray()).find((el) => el.native)
}

const fungibleTokens = async () => {
  return (await dbBase.tokens.toArray()).filter((el) => el.tokenType === db.TokenType.Fungible)
}

defineExpose({
  createToken,
  deleteToken,
  updateToken,
  nativeToken,
  fungibleTokens
})

</script>
