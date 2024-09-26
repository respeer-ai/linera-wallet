<template>
  <div>
    <RpcBlockBridge ref='rpcBlockBridge' />
    <RpcAccountBridge ref='rpcAccountBridge' />
    <DbMicrochainBridge ref='dbMicrochainBridge' v-model:microchains='microchains' />
    <DbMicrochainOwnerBridge ref='dbMicrochainOwnerBridge' />
    <DbMicrochainBalanceBridge ref='dbMicrochainBalanceBridge' />
    <DbMicrochainOwnerBalanceBridge ref='dbMicrochainOwnerBalanceBridge' />
    <DbOwnerBridge ref='dbOwnerBridge' />
    <DbTokenBridge ref='dbTokenBridge' />
  </div>
</template>

<script setup lang='ts'>
import { onMounted, ref, watch } from 'vue'
import { db, rpc } from 'src/model'
import { dbBase } from 'src/controller'
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { _hex } from 'src/utils'

import RpcBlockBridge from '../bridge/rpc/BlockBridge.vue'
import RpcAccountBridge from '../bridge/rpc/AccountBridge.vue'
import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import DbMicrochainOwnerBridge from '../bridge/db/MicrochainOwnerBridge.vue'
import DbMicrochainBalanceBridge from '../bridge/db/MicrochainBalanceBridge.vue'
import DbMicrochainOwnerBalanceBridge from '../bridge/db/MicrochainOwnerBalanceBridge.vue'
import DbOwnerBridge from '../bridge/db/OwnerBridge.vue'
import DbTokenBridge from '../bridge/db/TokenBridge.vue'

const rpcBlockBridge = ref<InstanceType<typeof RpcBlockBridge>>()
const rpcAccountBridge = ref<InstanceType<typeof RpcAccountBridge>>()
const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()
const dbMicrochainOwnerBridge = ref<InstanceType<typeof DbMicrochainOwnerBridge>>()
const dbMicrochainBalanceBridge = ref<InstanceType<typeof DbMicrochainBalanceBridge>>()
const dbMicrochainOwnerBalanceBridge = ref<InstanceType<typeof DbMicrochainOwnerBalanceBridge>>()
const dbOwnerBridge = ref<InstanceType<typeof DbOwnerBridge>>()
const dbTokenBridge = ref<InstanceType<typeof DbTokenBridge>>()

const microchains = ref([] as db.Microchain[])

const subscribed = ref(new Map<string, boolean>())

const updateChainAccountBalances = async (microchain: db.Microchain, publicKeys: string[]) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const balancesResp = await rpcAccountBridge.value?.getChainAccountBalances([microchain.microchain], publicKeys) as rpc.ChainAccountBalancesResp
  if (!balancesResp[microchain.microchain]) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const nativeToken = (await dbTokenBridge.value?.nativeToken()) as db.Token
  if (!nativeToken) return
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const microchainBalance = (await dbMicrochainBalanceBridge.value?.microchainFungibleTokenBalance(microchain, nativeToken.id as number)) as db.MicrochainFungibleTokenBalance || {
    microchain: microchain.microchain,
    tokenId: nativeToken.id as number,
    balance: 0
  } as db.MicrochainFungibleTokenBalance
  microchainBalance.balance = Number(balancesResp[microchain.microchain].chain_balance)
  microchainBalance.id === undefined
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    ? await dbMicrochainBalanceBridge.value?.createMicrochainFungibleTokenBalance(microchain, microchainBalance.tokenId, microchainBalance.balance)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    : await dbMicrochainBalanceBridge.value?.updateMicrochainFungibleTokenBalance(microchainBalance)
  for (const publicKey of publicKeys) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const owner = await dbOwnerBridge.value?.publicKey2Owner(publicKey) as string
    if (!owner) return
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    const microchainOwnerBalance = (await dbMicrochainOwnerBalanceBridge.value?.microchainOwnerFungibleTokenBalance(microchain.microchain, owner, nativeToken.id as number)) as db.MicrochainOwnerFungibleTokenBalance || {
      microchain: microchain.microchain,
      owner,
      tokenId: nativeToken.id as number,
      balance: 0
    } as db.MicrochainOwnerFungibleTokenBalance
    microchainOwnerBalance.balance = Number(balancesResp[microchain.microchain].account_balances[publicKey])
    microchainOwnerBalance.id === undefined
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      ? await dbMicrochainOwnerBalanceBridge.value?.createMicrochainOwnerFungibleBalance(microchain.microchain, owner, nativeToken.id as number, microchainOwnerBalance.balance)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      : await dbMicrochainOwnerBalanceBridge.value?.updateMicrochainOwnerFungibleBalance(microchainOwnerBalance)
  }
}

const subscribeMicrochain = async (microchain: db.Microchain) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const owners = await dbMicrochainOwnerBridge.value?.getMicrochainOwners(microchain.microchain) as db.Owner[]
  if (!owners.length) return

  const publicKeys = owners.reduce((keys: string[], a): string[] => { keys.push(a.address); return keys }, [])
  await updateChainAccountBalances(microchain, publicKeys)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await rpcBlockBridge.value?.subscribe(
    microchain.microchain,
    async (height: number) => {
      const password = (await dbBase.passwords.toArray()).find((el) => el.active)
      if (!password) return Promise.reject(new Error('Invalid password'))
      const _password = db.decryptPassword(password)
      // TODO: process multiple owners chain
      const privateKey = db.privateKey(owners[0], _password)
      const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey)))
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      rpcBlockBridge.value?.signNewBlock(microchain.microchain, height, keyPair)
    }, async (hash: string) => {
      await updateChainAccountBalances(microchain, publicKeys)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const blockResp = await rpcBlockBridge.value?.getBlockWithHash(microchain.microchain, hash)
      console.log(blockResp)
      // TODO: add activity
    }, () => {
      // DO NOTHING
    })
}

const subscribeMicrochains = async () => {
  for (const microchain of microchains.value) {
    if (subscribed.value.get(microchain.microchain)) continue
    await subscribeMicrochain(microchain)
    subscribed.value.set(microchain.microchain, true)
  }
}

watch(microchains, async () => {
  await subscribeMicrochains()
})

onMounted(async () => {
  await subscribeMicrochains()
})

</script>
