<template>
  <NetworkBridge v-model:selected-network='selectedNetwork' />
  <PasswordBridge v-model:password='password' />
  <MicrochainBridge ref='microchainBridge' v-model:microchains='microchains' />
  <MicrochainOwnerBridge v-model:microchain-owners='microchainOwners' />
</template>

<script setup lang='ts'>
import { ref, watch } from 'vue'
import { db } from '../../../model'
import { dbBase, dbWallet } from '../../../controller'
import { liveQuery } from 'dexie'
import { useObservable } from '@vueuse/rxjs'

import NetworkBridge from './NetworkBridge.vue'
import PasswordBridge from './PasswordBridge.vue'
import MicrochainBridge from './MicrochainBridge.vue'
import MicrochainOwnerBridge from './MicrochainOwnerBridge.vue'

const selectedNetwork = ref(undefined as unknown as db.Network)
const password = ref(undefined as unknown as string)
const microchains = ref([] as db.Microchain[])
const microchainOwners = ref([] as db.MicrochainOwner[])

const owners = defineModel<db.Owner[]>('owners')
const selectedOwner = defineModel<db.Owner>('selectedOwner')

const microchainBridge = ref<InstanceType<typeof MicrochainBridge>>()

const _owners = useObservable<db.Owner[]>(
  liveQuery(async () => {
    return await dbWallet.owners.toArray()
  }) as never
)

watch(_owners, async () => {
  owners.value = _owners.value
  selectedOwner.value = _owners.value?.find((el) => el.selected)

  if (!selectedOwner.value) return

  const owner1 = await db.buildOwner(selectedOwner.value?.address, '37c3859da70f8f28d1b35ebcd75be6ef142f6589123fc84c6ae5157aa819ad', password.value, 'AAA')
  db.privateKey(owner1, password.value)
})

const resetSelected = async () => {
  const _owners = owners.value?.filter((owner) => owner.selected) || []
  for (const owner of _owners) {
    await dbWallet.owners.update(owner.id, { selected: false })
  }
}

const createOwner = async (publicKey: string, privateKey: string, name?: string, _password?: string) => {
  if (!_password) {
    const passwd = (await dbBase.passwords.toArray()).find((el) => el.active) as db.Password
    if (passwd) _password = db.decryptPassword(passwd)
  }
  if (!publicKey.length || !privateKey.length || !_password?.length) {
    throw Error('Invalid owner materials')
  }
  if (!name) {
    // TODO: add field to store account number
    name = db.DEFAULT_ACCOUNT_NAME + ' ' + (await dbWallet.owners.count()).toString()
  }
  if (await dbWallet.owners.where('address').equals(publicKey).first() !== undefined) return
  const owner = await db.buildOwner(publicKey, privateKey, _password, name)
  await resetSelected()
  await dbWallet.owners.add(owner)
}

const updateOwner = async (owner: db.Owner) => {
  if (owner.selected) await resetSelected()
  await dbWallet.owners.update(owner.id, owner)
}

const deleteOwner = async (id: number) => {
  await dbWallet.owners.delete(id)
}

const ownerBalance = (owner: db.Owner) => {
  const balance = microchainOwners.value.filter((el) => el.owner === owner.owner).reduce((sum) => sum + 0, 0)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const microchains = microchainBridge.value?.ownerMicrochains(owner.owner) || []
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  return balance + microchains.reduce((sum) => sum + 0, 0) || 0
}

const getOwnerWithPublicKey = async (publicKey: string) => {
  return (await dbWallet.owners.toArray()).find((el) => el.address === publicKey)
}

const getOwner = async (owner: string) => {
  return (await dbWallet.owners.toArray()).find((el) => el.owner === owner)
}

const getOwnerWithPublicKeyPrefix = async (prefix: string) => {
  return (await dbWallet.owners.toArray()).find((el) => el.address.includes(prefix.slice(prefix.startsWith('0x') ? 2 : 0)))
}

const publicKey2Owner = async (publicKey: string): Promise<string | undefined> => {
  return (await dbWallet.owners.toArray()).find((el) => el.address === publicKey)?.owner
}

defineExpose({
  createOwner,
  updateOwner,
  deleteOwner,
  ownerBalance,
  publicKey2Owner,
  getOwnerWithPublicKey,
  getOwnerWithPublicKeyPrefix,
  getOwner
})

</script>
