<template>
  <div class='page-padding full-width text-center home-token-balance'>
    <div>
      {{ tokenBalance.toFixed(4) }} TLINERA
    </div>
    <div class='item-currency-sub text-grey-8'>
      $ {{ usdBalance.toFixed(4) }} USD
    </div>
    <div class='row home-token-action text-center page-y-padding'>
      <q-space />
      <div class='home-token-action-btn cursor-pointer' disabled>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-currency-exchange' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          Exchange
        </div>
      </div>
      <div class='home-token-action-btn cursor-pointer' @click='onTransferClick'>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-arrow-up-right' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          Transfer
        </div>
      </div>
      <div class='home-token-action-btn cursor-pointer' disabled>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-arrow-repeat' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          Swap
        </div>
      </div>
      <div class='home-token-action-btn cursor-pointer' disabled>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-arrow-left-right' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          Bridge
        </div>
      </div>
      <div class='home-token-action-btn cursor-pointer' disabled>
        <q-avatar color='red-2' size='36px'>
          <q-icon name='bi-clock' size='24px' />
        </q-avatar>
        <div class='page-item-y-margin-top'>
          Stake
        </div>
      </div>
      <q-space />
    </div>
    <DbOwnerBalanceBridge v-model:token-balance='tokenBalance' v-model:usd-balance='usdBalance' :token-id='nativeTokenId' />
    <DbTokenBridge ref='dbTokenBridge' />
    <DbOwnerBridge v-model:selected-owner='selectedOwner' ref='dbOwnerBridge' />
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { localStore } from 'src/localstores'
import { db } from 'src/model'

import DbOwnerBalanceBridge from '../bridge/db/OwnerBalanceBridge.vue'
import DbTokenBridge from '../bridge/db/TokenBridge.vue'
import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'

const dbTokenBridge = ref<InstanceType<typeof DbTokenBridge>>()
const dbOwnerBridge = ref<InstanceType<typeof DbOwnerBridge>>()

const tokenBalance = ref(0)
const usdBalance = ref(0)
const nativeTokenId = ref(0)
const selectedOwner = ref(undefined as unknown as db.Owner)

const router = useRouter()

const onTransferClick = () => {
  void router.push({ path: localStore.setting.formalizePath('/transfer') })
}

const getBalance = async () => {
  if (!selectedOwner.value) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const nativeTokenId = (await dbTokenBridge.value?.nativeToken())?.id || 0
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const balance = await dbOwnerBridge.value?.ownerBalance(selectedOwner.value, nativeTokenId)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  tokenBalance.value = balance?.tokenBalance || 0
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  usdBalance.value = balance?.usdBalance || 0
}

watch(selectedOwner, async () => {
  await getBalance()
})

onMounted(async () => {
  await getBalance()
})

</script>
