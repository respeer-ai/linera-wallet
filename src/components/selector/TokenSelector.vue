<template>
  <q-card class='selector-card'>
    <p class='text-center text-bold text-grey-9 selector-title'>
      Select a token
    </p>
    <div class='selector-search'>
      <q-input
        dense
        outlined
        rounded
        v-model='searchText'
      >
        <template #prepend>
          <q-icon name='bi-search' size='16px' />
        </template>
      </q-input>
    </div>
    <div v-if='displayTokens.length > 0'>
      <TokenCardView v-for='_token in displayTokens' :key='_token.id' :token='_token' @click='onTokenClick(_token)' />
    </div>
  </q-card>
  <DbTokenBridge v-model:tokens='tokens' />
</template>

<script setup lang='ts'>
import { db } from 'src/model'
import { computed, ref } from 'vue'

import DbTokenBridge from '../bridge/db/TokenBridge.vue'
import TokenCardView from '../token/TokenCardView.vue'

const token = defineModel<db.Token>()
const emit = defineEmits<{(ev: 'selected', value?: db.Token): void}>()

const tokens = ref([] as db.Token[])
const searchText = ref('')
const displayTokens = computed(() => tokens.value.filter((el) => el.name.includes(searchText.value)))

const onTokenClick = (_token: db.Token) => {
  token.value = _token
  emit('selected', _token)
}

</script>

<style lang='sass' scoped>
::v-deep .q-stepper__step-inner
  padding: 0 !important
</style>
