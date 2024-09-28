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
    <DbActivityBridge ref='dbActivityBridge' />
    <RpcPendingMessagesBridge ref='rpcPendingMessagesBridge' />
    <RpcCalculateBlockStateHashBridge ref='rpcCalculateBlockStateHashBridge' />
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
import DbActivityBridge from '../bridge/db/ActivityBridge.vue'
import RpcPendingMessagesBridge from '../bridge/rpc/PendingMessagesBridge.vue'
import RpcCalculateBlockStateHashBridge from '../bridge/rpc/CalculateBlockStateHashBridge.vue'

const rpcBlockBridge = ref<InstanceType<typeof RpcBlockBridge>>()
const rpcAccountBridge = ref<InstanceType<typeof RpcAccountBridge>>()
const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()
const dbMicrochainOwnerBridge = ref<InstanceType<typeof DbMicrochainOwnerBridge>>()
const dbMicrochainBalanceBridge = ref<InstanceType<typeof DbMicrochainBalanceBridge>>()
const dbMicrochainOwnerBalanceBridge = ref<InstanceType<typeof DbMicrochainOwnerBalanceBridge>>()
const dbOwnerBridge = ref<InstanceType<typeof DbOwnerBridge>>()
const dbTokenBridge = ref<InstanceType<typeof DbTokenBridge>>()
const dbActivityBridge = ref<InstanceType<typeof DbActivityBridge>>()
const rpcPendingMessagesBridge = ref<InstanceType<typeof RpcPendingMessagesBridge>>()
const rpcCalculateBlockStateHashBridge = ref<InstanceType<typeof RpcCalculateBlockStateHashBridge>>()

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

const processNewRawBlock = async (microchain: db.Microchain, height: number) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const owners = await dbMicrochainOwnerBridge.value?.getMicrochainOwners(microchain.microchain) as db.Owner[]
  if (!owners.length) return

  const password = (await dbBase.passwords.toArray()).find((el) => el.active)
  if (!password) return Promise.reject(new Error('Invalid password'))

  const _password = db.decryptPassword(password)
  // TODO: process multiple owners chain
  const privateKey = db.privateKey(owners[0], _password)
  const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey)))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await rpcBlockBridge.value?.signNewBlock(microchain.microchain, height, keyPair)
}

const processNewBlock = async (microchain: db.Microchain, hash: string) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const owners = await dbMicrochainOwnerBridge.value?.getMicrochainOwners(microchain.microchain) as db.Owner[]
  if (!owners.length) return

  const publicKeys = owners.reduce((keys: string[], a): string[] => { keys.push(a.address); return keys }, [])
  await updateChainAccountBalances(microchain, publicKeys)

  await updateChainAccountBalances(microchain, publicKeys)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  const blockResp = await rpcBlockBridge.value?.getBlockWithHash(microchain.microchain, hash) as rpc.BlockResp
  for (const bundle of blockResp?.value?.executedBlock?.block?.incomingBundles || []) {
    for (const message of bundle.bundle.messages) {
      if (message.message?.System?.Credit) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        await dbActivityBridge.value?.createActivity(
          bundle.origin.sender,
          message.message?.System?.Credit?.source,
          blockResp.value.executedBlock.block.chainId,
          message.message?.System?.Credit?.target,
          message.message?.System?.Credit?.amount,
          blockResp.value.executedBlock.block.height,
          blockResp.value.executedBlock.block.timestamp,
          blockResp.hash,
          message.grant
        )
      }
    }
  }
  for (const operation of blockResp?.value?.executedBlock?.block.operations || []) {
    if (operation.System?.Transfer) {
      let grant = undefined as unknown as string | undefined
      for (const messages of blockResp?.value?.executedBlock?.outcome?.messages || []) {
        grant = messages.find((el) => {
          return el.destination?.Recipient === operation.System.Transfer.recipient.Account?.chain_id &&
                     el.message.source === operation.System.Transfer.owner &&
                     el.message.target === operation.System.Transfer.recipient?.Account?.owner
        })?.grant
        if (grant?.length) break
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await dbActivityBridge.value?.createActivity(
        blockResp.value.executedBlock.block.chainId,
        operation.System.Transfer.owner,
        operation.System.Transfer.recipient.Account.chain_id,
        operation.System.Transfer.recipient.Account.owner,
        operation.System.Transfer.amount,
        blockResp.value.executedBlock.block.height,
        blockResp.value.executedBlock.block.timestamp,
        blockResp.hash,
            grant as string
      )
    }
  }
}

const processNewIncomingMessage = (microchain: db.Microchain) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  rpcPendingMessagesBridge.value?.getPendingMessages(microchain.microchain).then(async (messages) => {
    console.log(messages)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const stateHash = await rpcCalculateBlockStateHashBridge.value?.calculateBlockStateHashWithFullMaterials(microchain.microchain)
    console.log(stateHash)
  }).catch((error) => {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`Fail get pending message ${error}`)
  })
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
      await processNewRawBlock(microchain, height)
    }, async (hash: string) => {
      await processNewBlock(microchain, hash)
    }, () => {
      processNewIncomingMessage(microchain)
    })
}

const subscribeMicrochains = async () => {
  for (const microchain of microchains.value) {
    if (subscribed.value.get(microchain.microchain)) continue
    await subscribeMicrochain({ ...microchain })
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
