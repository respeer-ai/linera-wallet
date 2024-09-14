<template>
  <DbMicrochainBridge ref='dbMicrochainBridge' />
  <RpcMicrochainBridge ref='rpcMicrochainBridge' />
  <RpcBlockBridge ref='rpcBlockBridge' />
</template>

<script setup lang="ts">
import { Ed25519SigningKey, Memory } from '@hazae41/berith'
import { _hex } from 'src/utils'
import { dbBase, dbWallet } from 'src/controller'
import { rpc, db } from 'src/model'
import { ref } from 'vue'

import DbMicrochainBridge from '../bridge/db/MicrochainBridge.vue'
import RpcMicrochainBridge from '../bridge/rpc/MicrochainBridge.vue'
import RpcBlockBridge from '../bridge/rpc/BlockBridge.vue'

const dbMicrochainBridge = ref<InstanceType<typeof DbMicrochainBridge>>()
const rpcMicrochainBridge = ref<InstanceType<typeof RpcMicrochainBridge>>()
const rpcBlockBridge = ref<InstanceType<typeof RpcBlockBridge>>()

const openMicrochain = async (): Promise<db.Microchain> => {
  const owner = (await dbWallet.owners.toArray()).find((el) => el.selected)
  if (!owner) return Promise.reject(new Error('Invalid owner'))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const resp = await rpcMicrochainBridge.value?.openChain(owner?.address) as rpc.OpenChainResp
  if (!resp) return Promise.reject(new Error('Invalid open chain'))
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
  const microchain = await dbMicrochainBridge.value?.createMicrochain(owner.owner, resp.chainId, resp.messageId, resp.certificateHash) as db.Microchain

  const typeNameBytes = new TextEncoder().encode('Nonce::')
  const bytes = new Uint8Array([...typeNameBytes, ..._hex.toBytes(resp.certificateHash)])
  const password = (await dbBase.passwords.toArray()).find((el) => el.active)
  if (!password) return Promise.reject(new Error('Invalid password'))
  const _password = db.decryptPassword(password)
  const privateKey = db.privateKey(owner, _password)
  const keyPair = Ed25519SigningKey.from_bytes(new Memory(_hex.toBytes(privateKey)))
  const signature = _hex.toHex(keyPair.sign(new Memory(bytes)).to_bytes().bytes)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await rpcMicrochainBridge.value?.initMicrochainChainStore(owner.address, signature, resp.chainId, resp.messageId, resp.certificateHash)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
  await rpcBlockBridge.value?.signNewBlock(resp.chainId, 0, keyPair)
  return microchain
}

defineExpose({
  openMicrochain
})

</script>
