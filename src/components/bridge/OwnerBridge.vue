<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
  <PasswordBridge v-model:password='password' />
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'
import { buildOwner, DEFAULT_ACCOUNT_NAME, Network, type Owner } from '../../model'
import { dbWallet } from '../../controller'
import { liveQuery } from 'dexie'
import { useObservable, from } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'
import PasswordBridge from './PasswordBridge.vue'

const selectedNetwork = ref(undefined as unknown as Network)
const password = ref(undefined as unknown as string)

const owners = defineModel<Owner[]>('owners')
const selectedOwner = defineModel<Owner>('selectedOwner')

const _owners = useObservable<Owner[]>(
  from(
    liveQuery(async () => {
      return await dbWallet.owners.toArray()
    })
  )
)

watch(_owners, () => {
  owners.value = _owners.value
  selectedOwner.value = _owners.value?.find((el) => el.selected)
})

const createOwner = async (publicKey: string, privateKey: string, name?: string) => {
  if (!publicKey.length || !privateKey.length || !password.value?.length) {
    throw Error('Invalid owner materials')
  }
  if (!name) {
    // TODO: add field to store account number
    name = DEFAULT_ACCOUNT_NAME + ' ' + (await dbWallet.owners.count()).toString()
  }
  const owner = await buildOwner(publicKey, privateKey, password.value, name)
  await dbWallet.owners.add(owner)
}

const updateOwner = async (owner: Owner) => {
  await dbWallet.owners.update(owner.address, owner)
}

const deleteOwner = async (address: string) => {
  await dbWallet.owners.delete(address)
}

defineExpose({
  createOwner,
  updateOwner,
  deleteOwner
})

</script>
