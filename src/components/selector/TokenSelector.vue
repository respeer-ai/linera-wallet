<template>
  <q-card class='selector-card'>
    <p class='text-center text-bold text-grey-9 selector-title'>
      {{ $t('MSG_SELECT_A_TOKEN') }}
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
      <TokenCardView
        v-for='_token in displayTokens' :key='_token.id' :token='_token' @click='onTokenClick(_token)'
        :active-native='false' :active='token?.applicationId === _token.applicationId'
      />
    </div>
  </q-card>
  <DbTokenBridge v-model:tokens='tokens' />
</template>

<script setup lang='ts'>
import { dbModel } from 'src/model'
import { computed, ref } from 'vue'

import DbTokenBridge from '../bridge/db/TokenBridge.vue'
import TokenCardView from '../token/TokenCardView.vue'

const token = defineModel<dbModel.Token>()
const emit = defineEmits<{(ev: 'selected', value?: dbModel.Token): void}>()

const tokens = ref([] as dbModel.Token[])
const searchText = ref('')
const displayTokens = computed(() => tokens.value.filter((el) => el.name.toLowerCase().includes(searchText.value.toLowerCase())))

const onTokenClick = (_token: dbModel.Token) => {
  token.value = _token
  emit('selected', _token)
}

</script>

<style lang='sass' scoped>
::v-deep .q-stepper__step-inner
  padding: 0 !important
</style>
